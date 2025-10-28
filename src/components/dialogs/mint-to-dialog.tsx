import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { isAddress, parseUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import * as z from "zod";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { useOwnerWriteContract } from "~/hooks/useOwnerWriteContract";
import { useIsContractOwner } from "~/hooks/useIsOwner";
import {
  TransactionStateManager,
  SuccessState,
} from "~/components/transaction/transaction-states";
import { AddressField } from "../forms/fields/address-field";
import { InputField } from "../forms/fields/input-field";
import { ResponsiveModal } from "../modal";
import { Button } from "../ui/button";
import { Form } from "../ui/form";

const FormSchema = z.object({
  amount: z.coerce.number().positive(),
  recipientAddress: z.string().refine(isAddress, "Invalid recipient address"),
});

const MintToForm = ({
  voucher_address,
  onTxHash,
  onProposalHash,
}: {
  voucher_address: string;
  onTxHash: (hash: string) => void;
  onProposalHash: (hash: string) => void;
}) => {
  const account = useAccount();
  const isOwner = useIsContractOwner(voucher_address);
  const balance = useBalance({
    address: account.address,
    token: voucher_address as `0x${string}`,
    query: {
      enabled: !!account.address && !!voucher_address,
    },
  });
  const form = useForm<
    z.input<typeof FormSchema>,
    unknown,
    z.output<typeof FormSchema>
  >({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: {
      amount: 0,
      recipientAddress: account.address,
    },
  });
  const { ownerWrite } = useOwnerWriteContract();

  const handleSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const txHash = await ownerWrite({
        address: voucher_address as `0x${string}`,
        abi: abi,
        functionName: "mintTo",
        args: [
          data.recipientAddress,
          parseUnits(data.amount.toString() ?? "", balance.data?.decimals ?? 6),
        ],
      });

      if (txHash.startsWith("proposed:")) {
        onProposalHash(txHash.replace("proposed:", ""));
      } else {
        onTxHash(txHash);
      }
    } catch (error) {
      console.error("Error minting tokens:", error);
    }
  };

  if (!isOwner) {
    return (
      <div className="space-y-4 text-center py-4">
        <p className="text-muted-foreground">
          You must be an owner of this voucher contract to mint tokens.
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
          <AddressField form={form} label="Recipient" name="recipientAddress" />
          <InputField form={form} name="amount" label="Amount" />
        </form>
      </Form>
      <div className="mt-4 flex justify-center">
        <Button
          onClick={() => void form.handleSubmit(handleSubmit)()}
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          Mint
        </Button>
      </div>
    </>
  );
};

const MintToDialog = ({
  voucher_address,
  button,
}: {
  voucher_address: string;
  button?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [proposalHash, setProposalHash] = useState<string | null>(null);
  const balance = useBalance({
    token: voucher_address as `0x${string}`,
    query: {
      enabled: !!voucher_address,
    },
  });

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
      button={button ?? <Button variant={"ghost"}>Mint To</Button>}
      title="Mint"
      description={
        !txHash && !proposalHash ? "Mint tokens to an address" : ""
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
            title: "Minting in Progress",
            description: "Please wait while your minting transaction is being processed...",
          }}
          successProps={{
            title: "Tokens Minted Successfully",
            description: `You have successfully minted ${balance.data?.symbol} tokens.`,
          }}
          errorProps={{
            errorMessage: "An error occurred while minting tokens.",
          }}
          onRetry={resetState}
          onClose={() => setOpen(false)}
          fallback={
            <MintToForm
              voucher_address={voucher_address}
              onTxHash={setTxHash}
              onProposalHash={setProposalHash}
            />
          }
        />
      )}
    </ResponsiveModal>
  );
};
export default MintToDialog;
