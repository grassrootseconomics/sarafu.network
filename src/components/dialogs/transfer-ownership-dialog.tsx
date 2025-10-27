import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { z } from "zod";
import { AddressField } from "~/components/forms/fields/address-field";
import {
  TransactionStateManager,
  SuccessState,
} from "~/components/transaction/transaction-states";
import { Button } from "~/components/ui/button";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { ResponsiveModal } from "../modal";
import { Form } from "../ui/form";
import AreYouSureDialog from "./are-you-sure";
import { useOwnerWriteContract } from "~/hooks/useOwnerWriteContract";
import { useIsContractOwner } from "~/hooks/useIsOwner";

const formSchema = z.object({
  newOwner: z.string().refine((val) => isAddress(val), {
    message: "Please enter a valid address",
  }),
});


interface TransferOwnershipDialogProps {
  voucher_address: `0x${string}`;
  button: React.ReactNode;
}

export function TransferOwnershipDialog({
  voucher_address,
  button,
}: TransferOwnershipDialogProps) {
  const [open, setOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [proposalHash, setProposalHash] = useState<string | null>(null);
  const { address } = useAccount();
  const isOwner = useIsContractOwner(voucher_address);
  const { ownerWrite } = useOwnerWriteContract();

  const form = useForm<z.input<typeof formSchema>, unknown, z.output<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {},
  });

  const handleTransferOwnership = (data: z.output<typeof formSchema>) => {
    if (!isAddress(data.newOwner)) {
      return;
    }

    ownerWrite({
      abi,
      address: voucher_address,
      functionName: "transferOwnership",
      args: [data.newOwner],
    })
      .then((hash) => {
        if (hash.startsWith("proposed:")) {
          setProposalHash(hash.replace("proposed:", ""));
        } else {
          setTxHash(hash);
        }
      })
      .catch((error) => {
        console.error("Error transferring ownership:", error);
      });
  };

  const resetState = () => {
    setTxHash(null);
    setProposalHash(null);
    form.reset();
  };

  useEffect(() => {
    if (!open) resetState();
  }, [open, form]);

  // Form Component
  const FormState = () => {
    if (!isOwner) {
      return (
        <div className="space-y-4 text-center py-4">
          <p className="text-muted-foreground">
            You must be an owner of this voucher contract to transfer ownership.
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
            <AddressField
              form={form}
              name="newOwner"
              label="New Owner"
              placeholder="Address, ENS Name or Phone number"
              description="The address that will become the new owner of this voucher"
            />
          </form>
        </Form>
        <div className="mt-4 flex justify-end">
          <AreYouSureDialog
            title="Transfer Ownership"
            button={
              <Button disabled={!form.formState.isValid}>
                Transfer Ownership
              </Button>
            }
            description="Are you sure you want to transfer ownership of this voucher to the new owner?"
            onYes={() => form.handleSubmit(handleTransferOwnership)()}
            disabled={!address || !form.formState.isValid}
          />
        </div>
      </>
    );
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      button={button}
      title="Transfer Ownership"
      description={
        !txHash && !proposalHash
          ? "Enter the address of the new owner. This action cannot be undone."
          : ""
      }
    >
      {proposalHash ? (
        <SuccessState
          title="Proposed for Multisig Approval"
          description="The transaction was submitted to the Gnosis Safe service. Other owners must approve before execution."
          onClose={() => setOpen(false)}
        />
      ) : (
        <TransactionStateManager
          txHash={txHash}
          pendingProps={{
            title: "Transaction Pending",
            description:
              "Please wait while your transaction is being processed...",
          }}
          successProps={{
            title: "Ownership Transferred",
            description:
              "The ownership of this voucher has been successfully transferred.",
          }}
          errorProps={{
            errorMessage: "An error occurred while transferring ownership.",
          }}
          onRetry={() => {
            void form.handleSubmit(handleTransferOwnership)();
          }}
          onClose={() => setOpen(false)}
          fallback={<FormState />}
        />
      )}
    </ResponsiveModal>
  );
}
