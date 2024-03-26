import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
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
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
    if (
      Number(data.amount) >
      data.voucher.swapLimit.formattedNumber -
        data.voucher.poolBalance.formattedNumber
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `You are trying to deposit more tokens than are allow. You can deposit ${data.voucher.swapLimit.formattedNumber - data.voucher.poolBalance.formattedNumber}`,
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
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={Boolean(props.button)}>
        {props.button ? (
          props.button
        ) : (
          <Button variant={"ghost"} onClick={() => setOpen(true)}>
            Donate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Donate</DialogTitle>
        </DialogHeader>
        <DonateToPoolForm onSuccess={() => setOpen(false)} pool={props.pool} />
      </DialogContent>
    </Dialog>
  );
};
export const DonateToPoolForm = ({
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
      poolAddress: pool.address,
    },
  });
  const voucher = form.watch("voucher");
  const max = voucher
    ? Math.min(
        voucher.swapLimit?.formattedNumber -
          voucher.poolBalance?.formattedNumber,
        voucher.userBalance?.formattedNumber
      )
    : 0;
  const donate = useWriteContract({
    config: config,
  });
  const { handleSubmit, formState } = form;
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!data.voucher) return;
    const toastId = "donate";

    try {
      toast.info("Waiting for Approval Reset ", {
        id: toastId,
        description: "Please confirm the transaction in your wallet.",
        duration: 15000,
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
            name: "voucher",
            placeholder: "Select token",
            items: pool.voucherDetails.data,
          }}
          getLabel={(x) => `${x.name} (${x.symbol})`}
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
            donate.isPending ||
            form.formState.isSubmitting ||
            !form.formState.isValid
          }
        >
          {donate.isPending || formState.isSubmitting ? <Loading /> : "Donate"}
        </Button>
      </form>
    </Form>
  );
};
