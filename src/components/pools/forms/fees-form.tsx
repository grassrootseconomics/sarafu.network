import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAddress, parseUnits } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { z } from "zod";
import { AddressField } from "~/components/forms/fields/address-field";
import { InputField } from "~/components/forms/fields/input-field";
import { swapPoolAbi } from "~/contracts/swap-pool/contract";
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
import { type SwapPool } from "../types";

const FormSchema = z.object({
  poolAddress: z.string().refine(isAddress, "Invalid pool address"),
  feeAddress: z.string().refine(isAddress, "Invalid fee address"),
  feePercentage: z.coerce.number().min(0).max(100),
});

interface PoolFeesProps {
  pool: SwapPool;
  button?: React.ReactNode;
}

export const PoolFeesDialog = (props: PoolFeesProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={buttonVariants({
          variant: "outline",
        })}
      >
        Set Fees
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Fees</DialogTitle>
        </DialogHeader>
        <PoolFeesForm onSuccess={() => setOpen(false)} pool={props.pool} />
      </DialogContent>
    </Dialog>
  );
};

export const PoolFeesForm = ({
  pool,
  onSuccess,
}: {
  pool: SwapPool;
  onSuccess: () => void;
}) => {
  const config = useConfig();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      poolAddress: pool?.address,
      feeAddress: pool.feeAddress,
      feePercentage: pool.feePercentage,
    },
  });

  const contract = useWriteContract({
    config: config,
  });

  const { handleSubmit, formState } = form;

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      // Update Fee Address
      if (data.feeAddress !== pool.feeAddress) {
        const feeAddressToastId = "feeAddressUpdate";
        toast.info("Updating the fee address", {
          id: feeAddressToastId,
          description: "Please confirm the transaction in your wallet.",
          duration: 15000,
        });

        const feeAddressHash = await contract.writeContractAsync({
          abi: swapPoolAbi,
          address: data.poolAddress,
          functionName: "setFeeAddress",
          args: [data.feeAddress],
        });

        toast.loading("Waiting for Fee Address Confirmation", {
          id: feeAddressToastId,
          description: "",
          duration: 15000,
        });

        await waitForTransactionReceipt(config, { hash: feeAddressHash });

        toast.success("Fee Address Updated Successfully", {
          id: feeAddressToastId,
          duration: undefined,
          action: {
            label: "View Transaction",
            onClick: () =>
              window.open(celoscanUrl.tx(feeAddressHash), "_blank"),
          },
          description: `You have successfully updated the fee address to ${data.feeAddress}.`,
        });
      }

      // Update Fee Percentage
      if (data.feePercentage !== pool.feePercentage) {
        const feePercentageToastId = "feePercentageUpdate";
        toast.info("Updating the fee percentage", {
          id: feePercentageToastId,
          description: "Please confirm the transaction in your wallet.",
          duration: 15000,
        });

        const feePercentage = parseUnits(data.feePercentage.toString(), 4);
        const feePercentageHash = await contract.writeContractAsync({
          abi: swapPoolAbi,
          address: data.poolAddress,
          functionName: "setFee",
          args: [feePercentage],
        });

        console.log(feePercentageHash);

        toast.loading("Waiting for Fee Percentage Confirmation", {
          id: feePercentageToastId,
          description: "",
          duration: 15000,
        });

        await waitForTransactionReceipt(config, { hash: feePercentageHash });

        toast.success("Fee Percentage Updated Successfully", {
          id: feePercentageToastId,
          duration: undefined,
          action: {
            label: "View Transaction",
            onClick: () =>
              window.open(celoscanUrl.tx(feePercentageHash), "_blank"),
          },
          description: `You have successfully updated the fee percentage to ${data.feePercentage}%.`,
        });
      }

      onSuccess();
    } catch (error) {
      toast.error((error as Error).name, {
        id: "feesUpdateError",
        description: ((error as Error).cause as string) || "An error occurred.",
        duration: undefined,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AddressField name="feeAddress" label="Fee Address" form={form} />
        <InputField name="feePercentage" label="Fee Percentage" form={form} />
        <Button
          type="submit"
          className="w-full"
          disabled={
            contract.isPending ||
            form.formState.isSubmitting ||
            !form.formState.isValid
          }
        >
          {contract.isPending || formState.isSubmitting ? (
            <Loading />
          ) : (
            "Update"
          )}
        </Button>
      </form>
    </Form>
  );
};
