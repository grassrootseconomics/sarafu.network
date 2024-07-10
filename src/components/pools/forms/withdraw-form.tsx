import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAddress, parseUnits } from "viem";
import { useWriteContract } from "wagmi";
import { z } from "zod";
import { swapPoolAbi } from "~/contracts/swap-pool/contract";
import { config } from "~/lib/web3";
import { celoscanUrl } from "~/utils/celo";
import { Loading } from "../../loading";
import { Button, buttonVariants } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
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
    if (Number(data.amount) > data.voucher.poolBalance.formattedNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You are trying to withdraw more than the pools balance",
        path: ["amount"],
      });
    }
  });
interface WithdrawFromPoolProps {
  pool: SwapPool;
  button?: React.ReactNode;
}
export const WithdrawFromPoolButton = (props: WithdrawFromPoolProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={buttonVariants({
          variant: "outline",
        })}
      >
        Withdraw
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw</DialogTitle>
        </DialogHeader>
        <WithdrawFromPoolForm
          onSuccess={() => setOpen(false)}
          pool={props.pool}
        />
      </DialogContent>
    </Dialog>
  );
};
export const WithdrawFromPoolForm = ({
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
  const max = voucher ? Math.min(voucher.poolBalance?.formattedNumber) : 0;
  const withdraw = useWriteContract({
    config: config,
  });
  const { handleSubmit, formState } = form;
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!data.voucher) return;

    const toastId = "withdraw";
    try {
      toast.info("Waiting for Approval Reset ", {
        id: toastId,
        description: "Please confirm the transaction in your wallet.",
        duration: 15000,
      });
      const hash = await withdraw.writeContractAsync({
        abi: swapPoolAbi,
        address: data.poolAddress,
        functionName: "withdraw",
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
        description: `You have successfully withdrawn ${data.amount} ${data.voucher.symbol}.`,
      });
      onSuccess();
    } catch (error) {
      toast.error((error as Error).name, {
        id: toastId,
        description: (error as Error).cause as string,
        duration: undefined,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SwapField
          selectProps={{
            form,
            name: "voucher",
            placeholder: "Select token",
            items: pool?.voucherDetails || [],
            searchableValue: (x) => `${x.name} ${x.symbol}`,
            renderSelectedItem: (x) => x.name,
            renderItem: (x) => (
              <div className="flex justify-between w-full flex-wrap">
                {x.name}
                <div className="ml-auto">
                  {x.poolBalance?.formatted} {x.symbol}
                </div>
              </div>
            ),
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
          disabled={
            withdraw.isPending ||
            form.formState.isSubmitting ||
            !form.formState.isValid
          }
        >
          {withdraw.isPending || formState.isSubmitting ? (
            <Loading />
          ) : (
            "Withdraw"
          )}
        </Button>
      </form>
    </Form>
  );
};
