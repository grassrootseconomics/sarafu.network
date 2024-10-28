import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt } from "@wagmi/core";
import { SproutIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { erc20Abi, isAddress, parseUnits } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { z } from "zod";
import { ResponsiveModal } from "~/components/modal";
import { swapPoolAbi } from "~/contracts/swap-pool/contract";
import { celoscanUrl } from "~/utils/celo";
import { truncateByDecimalPlace } from "~/utils/number";
import { Loading } from "../../loading";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";
import { SwapField } from "../swap-field";
import { type SwapPool } from "../types";
import { zodPoolVoucher } from "./swap-form";

const FormSchema = z
  .object({
    poolAddress: z.string().refine(isAddress, "Invalid pool address"),
    voucher: zodPoolVoucher.optional(),
    amount: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.voucher) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `You must select a voucher`,
        path: ["amount"],
      });
      return;
    }
    if (Number(data.amount) > data.voucher.swapLimit.formattedNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `You are trying to deposit more tokens than are allowed. You can deposit ${data.voucher.swapLimit.formattedNumber}`,
        path: ["amount"],
      });
    }
  });
interface DonateToPoolProps {
  pool: SwapPool;
  button?: React.ReactNode;
}
export const DonateToPoolButton = (props: DonateToPoolProps) => {
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveModal
      button={
        <Button
          variant={"outline"}
          className="mx-auto"
          disabled={Number(props.pool.tokenIndex.entryCount) === 0}
        >
          <SproutIcon className="size-5 mr-2" /> Seed/Donate
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
      title="Seed/Donate"
      description="Donate to the pool to increase the liquidity"
    >
      <DonateToPoolForm onSuccess={() => setOpen(false)} pool={props.pool} />
    </ResponsiveModal>
  );
};

/**
 * Pools donate to pool form
 * @param {
 *   pool,
 *   onSuccess,
 * }
 * @returns
 */
const DonateToPoolForm = ({
  pool,
  onSuccess,
}: {
  pool: SwapPool;
  onSuccess: () => void;
}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      poolAddress: pool?.address,
    },
  });
  const voucher = form.watch("voucher");
  const config = useConfig();
  const max = voucher
    ? truncateByDecimalPlace(
        Math.min(
          voucher.swapLimit?.formattedNumber,
          voucher.userBalance?.formattedNumber
        ),
        2
      )
    : 0;
  const donate = useWriteContract({
    config: config,
  });
  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = form;
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!data.voucher) return;
    const toastId = "donate";

    try {
      toast.info("Waiting for Approval Reset ", {
        id: toastId,
        action: null,
        description: "Please confirm the transaction in your wallet.",
        duration: 15000,
      });
      const approvalResetHash = await donate.writeContractAsync({
        address: data.voucher.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [data.poolAddress, BigInt(0)],
      });
      toast.loading("Waiting for Confirmation", {
        id: toastId,
        description: "",
        duration: 15000,
      });
      await waitForTransactionReceipt(config, {
        hash: approvalResetHash,
      });
      toast.info("Waiting for Approval of Transaction", {
        id: toastId,
        description: "Please confirm the transaction in your wallet.",
        duration: 15000,
      });
      const hash2 = await donate.writeContractAsync({
        address: data.voucher.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          data.poolAddress,
          parseUnits(data.amount, Number(data.voucher.decimals)),
        ],
      });
      toast.loading("Waiting for Confirmation", {
        id: toastId,
        description: "",
        duration: 15000,
      });
      await waitForTransactionReceipt(config, {
        hash: hash2,
      });
      const hash = await donate.writeContractAsync({
        abi: swapPoolAbi,
        address: data.poolAddress,
        functionName: "deposit",
        args: [
          data.voucher.address,
          parseUnits(data.amount, data.voucher.decimals),
        ],
      });
      toast.loading("Waiting for Confirmation", {
        id: toastId,
        description: "",
        duration: 15000,
      });
      await waitForTransactionReceipt(config, {
        hash,
      });

      toast.success("Success", {
        id: toastId,
        duration: undefined,
        action: {
          label: "View Transaction",
          onClick: () => window.open(celoscanUrl.tx(hash), "_blank"),
        },
        description: `You have successfully donated ${data.amount} ${data.voucher.symbol}.`,
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        id: toastId,
        description: "An error occurred while donating",
        duration: undefined,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SwapField
          selectProps={{
            name: "voucher",
            placeholder: "Select token",
            items: pool?.voucherDetails ?? [],
            searchableValue: (x) => `${x.name} ${x.symbol}`,
            form: form,
            renderItem: (x) => (
              <div className="flex justify-between w-full flex-wrap items-center">
                {x.name}
                <div className="ml-2 bg-gray-100 rounded-md px-2 py-1">
                  {x.userBalance?.formatted}&nbsp;
                  <strong>{x.symbol}</strong>
                </div>
              </div>
            ),
            renderSelectedItem: (x) => `${x.name} (${x.symbol})`,
            getFormValue: (x) => x,
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
              form.setValue("amount", max.toString(), { shouldValidate: true });
            }}
          >
            {max} {voucher?.symbol ?? ""}
          </span>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={donate.isPending || isSubmitting || !isValid}
        >
          {donate.isPending || isSubmitting ? <Loading /> : "Seed/Donate"}
        </Button>
      </form>
    </Form>
  );
};
