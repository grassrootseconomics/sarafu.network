"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import * as z from "zod";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { AddressField } from "../forms/fields/address-field";
import { ResponsiveModal } from "../modal";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { useOwnerWriteContract } from "~/hooks/useOwnerWriteContract";
import { useIsContractOwner } from "~/hooks/useIsOwner";
import {
  TransactionStateManager,
  SuccessState,
} from "~/components/transaction/transaction-states";

const FormSchema = z.object({
  sinkAddress: z.string().refine(isAddress, "Invalid address"),
});

const ChangeSinkAddressForm = ({
  voucher_address,
  onSuccess,
  onTxHash,
  onProposalHash,
}: {
  voucher_address: string;
  onSuccess?: (hash: string) => void;
  onTxHash: (hash: string) => void;
  onProposalHash: (hash: string) => void;
}) => {
  const queryClient = useQueryClient();
  const isOwner = useIsContractOwner(voucher_address);
  const form = useForm<
    z.input<typeof FormSchema>,
    unknown,
    z.output<typeof FormSchema>
  >({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
  });
  const { ownerWrite } = useOwnerWriteContract();

  const handleSubmit = async (data: z.output<typeof FormSchema>) => {
    try {
      const txHash = await ownerWrite({
        address: voucher_address as `0x${string}`,
        abi: abi,
        functionName: "setSinkAddress",
        args: [data.sinkAddress],
      });

      if (txHash.startsWith("proposed:")) {
        onProposalHash(txHash.replace("proposed:", ""));
      } else {
        onTxHash(txHash);
        onSuccess?.(txHash);
      }

      // Invalidate queries after successful transaction
      queryClient
        .refetchQueries({ queryKey: ["readContracts"] })
        .catch((err) => {
          console.error(err);
        });
    } catch (error) {
      console.error("Error changing community fund:", error);
    }
  };

  if (!isOwner) {
    return (
      <div className="space-y-4 text-center py-4">
        <p className="text-muted-foreground">
          You must be an owner of this voucher contract to change the community
          fund.
        </p>
        <p className="text-sm text-muted-foreground">
          Please connect with an owner wallet to perform this action.
        </p>
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form className="space-y-4 py-4">
          <AddressField form={form} name="sinkAddress" label="Sink Address" />
        </form>
      </Form>
      <div className="mt-4 flex justify-center">
        <Button
          onClick={() => void form.handleSubmit(handleSubmit)()}
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          Change Community Fund
        </Button>
      </div>
    </>
  );
};

const ChangeSinkAddressDialog = ({
  voucher_address,
  button,
  onSuccess,
}: {
  voucher_address: string;
  button?: React.ReactNode;
  onSuccess?: (hash: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [proposalHash, setProposalHash] = useState<string | null>(null);

  const resetState = () => {
    setTxHash(null);
    setProposalHash(null);
  };

  useEffect(() => {
    if (!open) resetState();
  }, [open]);

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      button={
        button ?? <Button variant={"ghost"}>Change Community Fund</Button>
      }
      title="Change Community Fund"
      description={
        !txHash && !proposalHash
          ? "Change the address of the community fund"
          : ""
      }
    >
      {proposalHash ? (
        <SuccessState
          title="Proposed for Multisig Approval"
          description="The transaction was submitted to the Safe service. Other owners must approve before execution."
          onClose={() => setOpen(false)}
        />
      ) : (
        <TransactionStateManager
          txHash={txHash}
          pendingProps={{
            title: "Changing Community Fund",
            description:
              "Please wait while your transaction is being processed...",
          }}
          successProps={{
            title: "Community Fund Changed Successfully",
            description:
              "You have successfully changed the community fund address.",
          }}
          errorProps={{
            errorMessage: "An error occurred while changing the community fund.",
          }}
          onRetry={resetState}
          onClose={() => setOpen(false)}
          fallback={
            <ChangeSinkAddressForm
              voucher_address={voucher_address}
              onSuccess={onSuccess}
              onTxHash={setTxHash}
              onProposalHash={setProposalHash}
            />
          }
        />
      )}
    </ResponsiveModal>
  );
};

export default ChangeSinkAddressDialog;
