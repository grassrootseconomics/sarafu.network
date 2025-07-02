import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { z } from "zod";
import { AddressField } from "~/components/forms/fields/address-field";
import { TransactionStateManager } from "~/components/transaction/transaction-states";
import { Button } from "~/components/ui/button";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { ResponsiveModal } from "../modal";
import { Form } from "../ui/form";
import AreYouSureDialog from "./are-you-sure";

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
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

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

    try {
      writeContract(
        {
          abi,
          address: voucher_address,
          functionName: "transferOwnership",
          args: [data.newOwner],
        },
        {
          onSuccess(hash) {
            setTxHash(hash);
          },
          onError(error) {
            console.error("Error transferring ownership:", error);
          },
        }
      );
    } catch (error) {
      console.error("Error transferring ownership:", error);
    }
  };

  const resetState = () => {
    setTxHash(null);
    form.reset();
  };

  useEffect(() => {
    if (!open) resetState();
  }, [open, form]);

  // Form Component
  const FormState = () => (
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

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      button={button}
      title="Transfer Ownership"
      description={
        !txHash
          ? "Enter the address of the new owner. This action cannot be undone."
          : ""
      }
    >
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
    </ResponsiveModal>
  );
}
