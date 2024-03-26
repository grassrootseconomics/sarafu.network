import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { erc20Abi, isAddress, parseUnits } from "viem";
import { useWriteContract } from "wagmi";
import { z } from "zod";

import { swapPoolAbi } from "~/contracts/swap-pool/contract";
import { config } from "~/lib/web3";
import { celoscanUrl } from "~/utils/celo";
import { truncateByDecimalPlace } from "~/utils/number";
import { Loading } from "../../loading";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";
import { convert, type useSwapPool } from "../hooks";
import { SwapField } from "../swap-field";

const zodBalance = z.object({
  value: z.bigint(),
  formatted: z.string(),
  formattedNumber: z.number(),
});

export const zodPoolVoucher = z.object({
  address: z.string().refine(isAddress, "Invalid address"),
  priceIndex: z.bigint(),
  poolBalance: zodBalance,
  userBalance: zodBalance,
  swapLimit: zodBalance,
  symbol: z.string(),
  decimals: z.number(),
});

const swapFormSchema = z
  .object({
    fromToken: zodPoolVoucher.optional(),
    toToken: zodPoolVoucher.optional(),
    amount: z.string(),
    toAmount: z.string(),
  })
  .superRefine((data, ctx) => {
    const { fromToken, toToken } = data;
    if (!fromToken || !toToken) return;

    const amountToBeSwapped = Number(data.amount);
    const priceRatio =
      Number(fromToken.priceIndex) / Number(toToken.priceIndex);
    const exceedsPoolBalance =
      amountToBeSwapped * priceRatio > toToken.poolBalance.formattedNumber;
    const exceedsSwapLimit =
      amountToBeSwapped > Number(fromToken.swapLimit?.formatted);
    const exceedsUserBalance =
      amountToBeSwapped > Number(fromToken.userBalance?.formatted);

    if (exceedsPoolBalance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Pool does not have enough ${toToken.symbol} to swap`,
        path: ["amount"],
      });
    }

    if (exceedsSwapLimit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The maximum ${fromToken.symbol} you can swap is ${fromToken.swapLimit?.formatted}`,
        path: ["amount"],
      });
    }

    if (exceedsUserBalance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You are trying to swap more than you have",
        path: ["amount"],
      });
    }
  });

type SwapFormType = z.infer<typeof swapFormSchema>;
export function SwapForm({
  swapPool,
}: {
  swapPool: ReturnType<typeof useSwapPool>;
}) {
  const form = useForm<SwapFormType>({
    resolver: zodResolver(swapFormSchema),
    mode: "all",
    reValidateMode: "onChange",
  });

  const { watch, handleSubmit, setValue, formState } = form;
  const fromToken = watch("fromToken");
  const toToken = watch("toToken");
  const amount = watch("amount");

  const exchange = useWriteContract({
    config,
    mutation: {
      onError: (error) => toast.error(error.message),
    },
  });

  const approve = useWriteContract({
    config,
    mutation: {
      onError: (error) => toast.error(error.message),
    },
  });

  useEffect(() => {
    if (fromToken && toToken) {
      const val = convert(amount, fromToken, toToken)?.formatted ?? "";
      setValue("toAmount", val);
    } else {
      setValue("toAmount", "");
    }
  }, [amount, fromToken, toToken, setValue]);

  const toAmountMax = useMemo(
    () => convert(toToken?.poolBalance?.formatted, toToken, fromToken),
    [toToken, fromToken]
  );
  const max = useMemo(
    () =>
      truncateByDecimalPlace(
        Math.min(
          fromToken?.swapLimit?.formattedNumber ?? 0,
          fromToken?.userBalance?.formattedNumber ?? 0,
          toAmountMax?.formattedNumber ?? 0
        ),
        2
      ) ?? 0,
    [fromToken, toAmountMax]
  );

  const onSubmit = async (data: z.infer<typeof swapFormSchema>) => {
    if (!data.fromToken || !data.toToken) return;
    try {
      toast.info("Waiting for Approval Reset ", {
        id: "swap",
        description: "Please confirm the transaction in your wallet.",
        duration: 15000,
      });
      const hash = await approve.writeContractAsync({
        address: data.fromToken.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [swapPool.address, BigInt(0)],
      });
      toast.loading("Waiting for Confirmation", {
        id: "swap",
        description: "",
        duration: 15000,
      });
      await waitForTransactionReceipt(config, {
        hash,
      });
      toast.info("Waiting for Approval of Transaction", {
        id: "swap",
        description: "Please confirm the transaction in your wallet.",
        duration: 15000,
      });
      const hash2 = await approve.writeContractAsync({
        address: data.fromToken.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          swapPool.address,
          parseUnits(amount, Number(data.fromToken.decimals)),
        ],
      });
      toast.loading("Waiting for Confirmation", {
        id: "swap",
        description: "",
        duration: 15000,
      });
      await waitForTransactionReceipt(config, {
        hash: hash2,
      });
      toast.info("Waiting for Swap Transaction", {
        id: "swap",
        description: "Please confirm the transaction in your wallet.",
        duration: 15000,
      });
      const hash3 = await exchange.writeContractAsync({
        address: swapPool.address,
        abi: swapPoolAbi,
        functionName: "withdraw",
        args: [
          data.toToken.address,
          data.fromToken.address,
          parseUnits(data.amount, Number(data.fromToken.decimals)),
        ],
      });
      toast.info("Waiting for Confirmation", {
        id: "swap",
        description: "",
        duration: 15000,
        action: {
          label: "View Transaction",
          onClick: () => window.open(celoscanUrl.tx(hash3), "_blank"),
        },
      });
      await waitForTransactionReceipt(config, {
        hash: hash3,
      });
      toast.success("Success", {
        id: "swap",
        duration: undefined,
        action: {
          label: "View Transaction",
          onClick: () => window.open(celoscanUrl.tx(hash3), "_blank"),
        },
        description: `You have successfully swapped ${data.amount} ${data.fromToken.symbol} for ${data.toAmount} ${data.toToken.symbol}.`,
      });
      await swapPool.voucherDetails.refetch();
    } catch (error) {
      toast.error((error as Error).name, {
        id: "swap",
        description: (error as Error).cause as string,
        duration: undefined,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SwapField
          getLabel={(voucher) => `${voucher.name} (${voucher.symbol})`}
          selectProps={{
            name: "fromToken",
            placeholder: "Select token",
            items:
              swapPool.voucherDetails.data.filter(
                (x) => x.address != toToken?.address
              ) ?? [],
          }}
          inputProps={{
            name: "amount",
            label: "From",
            placeholder: "Amount",
            type: "number",
          }}
          form={form}
        />
        {/* Max */}
        <div className="flex justify-end">
          <strong>Max &nbsp;</strong>
          <span
            className="cursor-pointer"
            onClick={() => {
              if (!fromToken || !fromToken.userBalance || !fromToken.decimals)
                return;
              form.setValue("amount", max.toString(), { shouldValidate: true });
            }}
          >
            {max} {fromToken?.symbol ?? ""}
          </span>
        </div>
        <SwapField
          getLabel={(voucher) => `${voucher.name} (${voucher.symbol})`}
          selectProps={{
            name: "toToken",
            placeholder: "Select token",
            items:
              swapPool.voucherDetails.data.filter(
                (x) => x.address != fromToken?.address
              ) ?? [],
          }}
          inputProps={{
            name: "toAmount",
            label: "To",
            placeholder: "Amount",
            disabled: true,
            type: "number",
          }}
          form={form}
        />
        {/* Fee */}
        <div className="flex justify-between text-gray-400">
          <span>Fee</span>
          <span>{Number(swapPool.feePpm) / 10000} %</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Amount</span>
          <span>
            {(
              Number(amount ?? "0") *
              (Number(swapPool.feePpm) / 10000)
            ).toString() + ` ${fromToken?.symbol ?? ""}`}
          </span>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={
            exchange.isPending || formState.isSubmitting || !formState.isValid
          }
        >
          {exchange.isPending || formState.isSubmitting ? <Loading /> : "Swap"}
        </Button>
      </form>
    </Form>
  );
}
