"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { waitForTransactionReceipt } from "@wagmi/core";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAddress } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import * as z from "zod";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { celoscanUrl } from "~/utils/celo";
import { AddressField } from "../forms/fields/address-field";
import { Loading } from "../loading";
import { ResponsiveModal } from "../modal";
import { Button } from "../ui/button";
import { Form } from "../ui/form";

const FormSchema = z.object({
  sinkAddress: z.string().refine(isAddress, "Invalid address"),
});

const ChangeSinkAddressForm = ({
  voucher_address,
  onSuccess,
}: {
  voucher_address: string;
  onSuccess?: (hash: `0x${string}`) => void;
}) => {
  const queryClient = useQueryClient();
  const config = useConfig();
  // Get QueryClient from the context
  const form = useForm<z.input<typeof FormSchema>, unknown, z.output<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
  });
  const changeSink = useWriteContract();
  const handleSubmit = async (data: z.output<typeof FormSchema>) => {
    const toastId = "sinkToast";

    try {
      toast.info(`Changing Community Fund`, {
        id: toastId,
        description: "Please confirm the transaction in your wallet.",
        duration: 15000,
      });

      const txHash = await changeSink.writeContractAsync({
        address: voucher_address as `0x${string}`,
        abi: abi,
        functionName: "setSinkAddress",

        args: [data.sinkAddress],
      });
      toast.loading("Waiting for Confirmation", {
        id: toastId,
        description: "",
        duration: 15000,
      });
      await waitForTransactionReceipt(config, { hash: txHash });

      toast.success("Success", {
        id: toastId,
        duration: undefined,
        action: {
          label: "View Transaction",
          onClick: () => window.open(celoscanUrl.tx(txHash), "_blank"),
        },
        description: `You have successfully changed the community fund to ${data.sinkAddress}.`,
      });
      onSuccess?.(txHash);
      queryClient
        .refetchQueries({ queryKey: ["readContracts"] })
        .catch((err) => {
          console.error(err);
        });
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        id: toastId,
        description: "An error occurred while changing the community fund",
        duration: undefined,
      });
    }
  };
  if (form.formState.isSubmitting) return <Loading />;
  return (
    <Form {...form}>
      <form
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        className="space-y-8"
      >
        <AddressField form={form} name="sinkAddress" label="Sink Address" />

        <div className="flex justify-center">
          <Button type="submit" disabled={changeSink.isPending}>
            {changeSink.isPending ? <Loading /> : "Change Sink Address"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const ChangeSinkAddressDialog = ({
  voucher_address,
  button,
}: {
  voucher_address: string;
  button?: React.ReactNode;
}) => {
  return (
    <ResponsiveModal
      button={
        button ?? <Button variant={"ghost"}>Change Community Fund</Button>
      }
      title="Change Community Fund"
      description="Change the address of the community fund"
    >
      <ChangeSinkAddressForm voucher_address={voucher_address} />
    </ResponsiveModal>
  );
};

export default ChangeSinkAddressDialog;
