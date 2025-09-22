import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { erc20Abi, isAddress, parseUnits } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { z } from "zod";

import { RefreshCcw } from "lucide-react";
import { ResponsiveModal } from "~/components/modal";
import { VoucherChip } from "~/components/voucher/voucher-chip";
import { defaultReceiptOptions } from "~/config/viem.config.server";
import { swapPoolAbi } from "~/contracts/swap-pool/contract";
import { trpc } from "~/lib/trpc";
import { celoscanUrl } from "~/utils/celo";
import { truncateByDecimalPlace } from "~/utils/units/number";
import { Loading } from "../../loading";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";
import { SwapField } from "../swap-field";
import { type SwapPool } from "../types";
import { convert } from "../utils";

const zodBalance = z.object({
  value: z.bigint(),
  formatted: z.string(),
  formattedNumber: z.number(),
});

export const zodPoolVoucher = z.object({
  address: z.custom<`0x${string}`>(isAddress, "Invalid address"),
  priceIndex: z.bigint(),
  poolBalance: zodBalance,
  userBalance: zodBalance,
  swapLimit: zodBalance,
  limitOf: zodBalance,
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
        message: `The pool does not have enough ${toToken.symbol} to swap`,
        path: ["amount"],
      });
    }

    if (exceedsSwapLimit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The pool has a limit of ${fromToken.limitOf.formatted} ${fromToken.symbol} and a balance of ${fromToken.poolBalance.formatted} ${fromToken.symbol} so the maximum you can swap is ${fromToken.swapLimit?.formatted} ${fromToken.symbol}`,
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

export function SwapForm({
  pool,
  onSuccess,
}: {
  pool: SwapPool | undefined;
  onSuccess?: () => void;
}) {
  const form = useForm<
    z.input<typeof swapFormSchema>,
    unknown,
    z.output<typeof swapFormSchema>
  >({
    resolver: zodResolver(swapFormSchema),
    mode: "all",
    reValidateMode: "onChange",
  });
  const config = useConfig();
  const { watch, handleSubmit, setValue } = form;
  const { isSubmitting, isValid } = form.formState;
  const utils = trpc.useUtils();
  const fromToken = watch("fromToken");
  const toToken = watch("toToken");
  const amount = watch("amount");

  const write = useWriteContract({
    config,
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
        Math.max(
          0,
          Math.min(
            fromToken?.swapLimit?.formattedNumber ?? 0,
            fromToken?.userBalance?.formattedNumber ?? 0,
            toAmountMax?.formattedNumber ?? 0
          )
        ),
        2
      ) ?? 0,
    [fromToken, toAmountMax]
  );
  const onSubmit = async (data: z.output<typeof swapFormSchema>) => {
    if (!data.fromToken || !data.toToken) return;
    try {
      toast.info("Waiting for Approval Reset ", {
        id: "swap",
        description: "Please confirm the transaction in your wallet.",
        duration: 15000,
        action: null,
      });
      const hash = await write.writeContractAsync({
        address: data.fromToken.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [pool!.address, BigInt(0)],
      });
      toast.loading("Waiting for Confirmation", {
        id: "swap",
        description: "",
        duration: 15000,
      });
      await waitForTransactionReceipt(config, {
        hash,
        ...defaultReceiptOptions,
      });
      toast.info("Waiting for Approval of Transaction", {
        id: "swap",
        description: "Please confirm the transaction in your wallet.",
        duration: 15000,
      });
      const hash2 = await write.writeContractAsync({
        address: data.fromToken.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          pool!.address,
          // Add 5% to the amount to account for demurrage
          (parseUnits(amount, Number(data.fromToken.decimals)) * 1005n) / 1000n,
        ],
      });

      toast.loading("Waiting for Confirmation", {
        id: "swap",
        description: "",
        duration: 15000,
      });
      await waitForTransactionReceipt(config, {
        hash: hash2,
        ...defaultReceiptOptions,
      });
      toast.info("Waiting for Swap Transaction", {
        id: "swap",
        description: "Please confirm the transaction in your wallet.",
        duration: 15000,
      });
      const hash3 = await write.writeContractAsync({
        address: pool!.address,
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
        ...defaultReceiptOptions,
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
      void utils.me.events.invalidate();
      void utils.me.vouchers.invalidate();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        id: "swap",
        description: "An error occurred while swapping",
        duration: undefined,
      });
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SwapField
          selectProps={{
            name: "fromToken",
            getFormValue: (voucher) => voucher,
            form: form,
            searchableValue: (x) => `${x.symbol} ${x.name}`,
            placeholder: "From",
            renderItem: (x) => (
              <div className="flex justify-between w-full flex-wrap items-center">
                <VoucherChip voucher_address={x.address} />
                <div className="ml-2 px-2 py-1">
                  {x.userBalance?.formatted}&nbsp;
                </div>
              </div>
            ),
            renderSelectedItem: (x) => (
              <VoucherChip voucher_address={x.address} />
            ),
            items:
              pool?.voucherDetails?.filter(
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
          selectProps={{
            name: "toToken",
            getFormValue: (voucher) => voucher,
            form: form,
            searchableValue: (x) => `${x.symbol} ${x.name}`,
            renderSelectedItem: (x) => (
              <VoucherChip voucher_address={x.address} />
            ),

            placeholder: "To",
            renderItem: (x) => (
              <div className="flex justify-between w-full flex-wrap items-center">
                <VoucherChip voucher_address={x.address} />
                <div className="ml-2 px-2 py-1">
                  {x.poolBalance?.formatted}&nbsp;
                </div>
              </div>
            ),
            items:
              pool?.voucherDetails?.filter(
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
          <span>{pool?.feePercentage?.toString()} %</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Fee Amount</span>
          <span>
            {(
              Number(amount ?? "0") *
              ((pool?.feePercentage ?? 0) / 100)
            ).toString() + ` ${fromToken?.symbol ?? ""}`}
          </span>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={write.isPending || isSubmitting || !isValid}
        >
          {write.isPending || isSubmitting ? <Loading /> : "Swap"}
        </Button>
      </form>
    </Form>
  );
}

export function SwapDialog({ pool }: { pool: SwapPool }) {
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      title="Swap"
      button={
        <Button disabled={Number(pool?.tokenIndex.entryCount) === 0}>
          <RefreshCcw className="mr-2 h-5 w-5" />
          Swap
        </Button>
      }
    >
      <SwapForm pool={pool} onSuccess={() => setOpen(false)} />
    </ResponsiveModal>
  );
}
