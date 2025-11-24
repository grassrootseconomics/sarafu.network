import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { encodeFunctionData, isAddress } from "viem";
import { useAccount, useConfig } from "wagmi";
import { z } from "zod";
import { AddressField } from "~/components/forms/fields/address-field";
import { useSwapPool } from "~/components/pools/hooks";
import { ResponsiveModal } from "~/components/responsive-modal";
import { SuccessState } from "~/components/transaction/transaction-states";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { tokenIndexABI } from "~/contracts/erc20-token-index/contract";
import { limiterAbi } from "~/contracts/limiter/contract";
import { priceIndexQuoteAbi } from "~/contracts/price-index-quote/contract";
import { swapPoolAbi } from "~/contracts/swap-pool/contract";
import { useContractOwner, useIsContractOwner } from "~/hooks/useIsOwner";
import { useOwnerWriteContract } from "~/hooks/useOwnerWriteContract";
import { Form } from "../ui/form";
import AreYouSureDialog from "./are-you-sure";

const formSchema = z.object({
  newOwner: z.string().refine((val) => isAddress(val), {
    message: "Please enter a valid address",
  }),
});

interface TransferPoolOwnershipDialogProps {
  pool_address: `0x${string}`;
  button: React.ReactNode;
}

type TransferStep = {
  name: string;
  status: "pending" | "in_progress" | "completed" | "error";
  txHash?: string;
  error?: string;
};

export function TransferPoolOwnershipDialog({
  pool_address,
  button,
}: TransferPoolOwnershipDialogProps) {
  const [open, setOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [steps, setSteps] = useState<TransferStep[]>([]);
  const [proposalHash, setProposalHash] = useState<string | null>(null);
  const { address } = useAccount();
  const config = useConfig();
  const isOwner = useIsContractOwner(pool_address);
  const poolOwnerInfo = useContractOwner(pool_address);
  const { ownerWrite } = useOwnerWriteContract();
  const { data: pool } = useSwapPool(pool_address);

  const form = useForm<
    z.input<typeof formSchema>,
    unknown,
    z.output<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {},
  });

  const handleTransferOwnership = async (data: z.output<typeof formSchema>) => {
    if (
      !isAddress(data.newOwner) ||
      !pool ||
      !address ||
      !poolOwnerInfo.address
    ) {
      return;
    }

    setIsTransferring(true);

    // Initialize steps
    const transferSteps: TransferStep[] = [
      { name: "SwapPool Contract", status: "pending" },
      { name: "Token Registry", status: "pending" },
      { name: "Token Limiter", status: "pending" },
      { name: "Quoter Contract", status: "pending" },
    ];
    setSteps(transferSteps);

    try {
      // If it's a Safe multisig with threshold > 1, create a batch transaction
      if (
        poolOwnerInfo.isMultisig &&
        poolOwnerInfo.multisigType === "Safe" &&
        (poolOwnerInfo.threshold ?? 0) > 1
      ) {
        setSteps((prev) => prev.map((s) => ({ ...s, status: "in_progress" })));

        // Prepare batch transactions for all contracts
        const batchTransactions = [
          {
            to: pool_address,
            value: "0",
            data: encodeFunctionData({
              abi: swapPoolAbi,
              functionName: "transferOwnership",
              args: [data.newOwner],
            }),
            operation: 0,
          },
        ];

        // Add Token Registry transfer if available
        if (pool.tokenRegistry) {
          batchTransactions.push({
            to: pool.tokenRegistry,
            value: "0",
            data: encodeFunctionData({
              abi: tokenIndexABI,
              functionName: "transferOwnership",
              args: [data.newOwner],
            }),
            operation: 0,
          });
        }

        // Add Token Limiter transfer if available
        if (pool.tokenLimiter) {
          batchTransactions.push({
            to: pool.tokenLimiter,
            value: "0",
            data: encodeFunctionData({
              abi: limiterAbi,
              functionName: "transferOwnership",
              args: [data.newOwner],
            }),
            operation: 0,
          });
        }

        // Add Quoter transfer if available
        if (pool.quoter) {
          batchTransactions.push({
            to: pool.quoter,
            value: "0",
            data: encodeFunctionData({
              abi: priceIndexQuoteAbi,
              functionName: "transferOwnership",
              args: [data.newOwner],
            }),
            operation: 0,
          });
        }

        // Create a single Safe batch transaction proposal with all transfers
        // Note: We need to use the Safe Protocol Kit directly for batch transactions
        const Safe = (await import("@safe-global/protocol-kit")).default;
        const { getConnectorClient } = await import("@wagmi/core");

        const connectorClient = await getConnectorClient(config, {
          account: address,
        });
        if (!connectorClient) throw new Error("Connector client not found");

        const protocolKit = await Safe.init({
          provider: connectorClient.transport,
          signer: address,
          safeAddress: poolOwnerInfo.address,
        });

        const nonce = await protocolKit.getNonce();
        const { client: trpcClient } = await import("~/lib/trpc");

        const pendingNonce = await trpcClient.safe.getPendingNonce.query({
          safeAddress: poolOwnerInfo.address,
          chainId: connectorClient.chain.id,
          nonce,
        });

        // Create batch transaction with all ownership transfers
        const safeTransaction = await protocolKit.createTransaction({
          transactions: batchTransactions,
          options: {
            nonce: pendingNonce.nonce,
          },
        });

        const safeTxHash = await protocolKit.getTransactionHash(
          safeTransaction
        );
        const signedSafeTransaction = await protocolKit.signTransaction(
          safeTransaction
        );
        const senderSignature =
          signedSafeTransaction.signatures.get(address.toLowerCase())?.data ??
          "0x";

        const proposalData = {
          safeAddress: poolOwnerInfo.address,
          safeTransactionData: signedSafeTransaction.data,
          safeTxHash,
          senderAddress: address,
          senderSignature: senderSignature,
          origin: "sarafu-network",
        };

        const result = await trpcClient.safe.proposeTx.mutate({
          ...proposalData,
          chainId: connectorClient.chain.id,
        });

        setProposalHash(result.safeTxHash);
        setSteps((prev) => prev.map((s) => ({ ...s, status: "completed" })));
        setIsTransferring(false);
        return;
      }

      // Non-multisig or single-owner Safe: Execute transfers sequentially
      // Step 1: Transfer SwapPool ownership
      setSteps((prev) =>
        prev.map((s, i) => (i === 0 ? { ...s, status: "in_progress" } : s))
      );

      const poolHash = await ownerWrite({
        abi: swapPoolAbi,
        address: pool_address,
        functionName: "transferOwnership",
        args: [data.newOwner],
      });

      if (poolHash.startsWith("proposed:")) {
        setProposalHash(poolHash.replace("proposed:", ""));
        setIsTransferring(false);
        return;
      }

      setSteps((prev) =>
        prev.map((s, i) =>
          i === 0 ? { ...s, status: "completed", txHash: poolHash } : s
        )
      );

      // Step 2: Transfer Token Registry ownership
      if (pool.tokenRegistry) {
        setSteps((prev) =>
          prev.map((s, i) => (i === 1 ? { ...s, status: "in_progress" } : s))
        );

        try {
          const registryHash = await ownerWrite({
            abi: tokenIndexABI,
            address: pool.tokenRegistry,
            functionName: "transferOwnership",
            args: [data.newOwner],
          });

          setSteps((prev) =>
            prev.map((s, i) =>
              i === 1 ? { ...s, status: "completed", txHash: registryHash } : s
            )
          );
        } catch (error) {
          setSteps((prev) =>
            prev.map((s, i) =>
              i === 1
                ? {
                    ...s,
                    status: "error",
                    error: error instanceof Error ? error.message : "Failed",
                  }
                : s
            )
          );
        }
      }

      // Step 3: Transfer Token Limiter ownership
      if (pool.tokenLimiter) {
        setSteps((prev) =>
          prev.map((s, i) => (i === 2 ? { ...s, status: "in_progress" } : s))
        );

        try {
          const limiterHash = await ownerWrite({
            abi: limiterAbi,
            address: pool.tokenLimiter,
            functionName: "transferOwnership",
            args: [data.newOwner],
          });

          setSteps((prev) =>
            prev.map((s, i) =>
              i === 2 ? { ...s, status: "completed", txHash: limiterHash } : s
            )
          );
        } catch (error) {
          setSteps((prev) =>
            prev.map((s, i) =>
              i === 2
                ? {
                    ...s,
                    status: "error",
                    error: error instanceof Error ? error.message : "Failed",
                  }
                : s
            )
          );
        }
      }

      // Step 4: Transfer Quoter ownership
      if (pool.quoter) {
        setSteps((prev) =>
          prev.map((s, i) => (i === 3 ? { ...s, status: "in_progress" } : s))
        );

        try {
          const quoterHash = await ownerWrite({
            abi: priceIndexQuoteAbi,
            address: pool.quoter,
            functionName: "transferOwnership",
            args: [data.newOwner],
          });

          setSteps((prev) =>
            prev.map((s, i) =>
              i === 3 ? { ...s, status: "completed", txHash: quoterHash } : s
            )
          );
        } catch (error) {
          setSteps((prev) =>
            prev.map((s, i) =>
              i === 3
                ? {
                    ...s,
                    status: "error",
                    error: error instanceof Error ? error.message : "Failed",
                  }
                : s
            )
          );
        }
      }
    } catch (error) {
      console.error("Error transferring ownership:", error);
      setSteps((prev) =>
        prev.map((s) =>
          s.status === "in_progress"
            ? {
                ...s,
                status: "error",
                error: error instanceof Error ? error.message : "Failed",
              }
            : s
        )
      );
    } finally {
      setIsTransferring(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSteps([]);
      setProposalHash(null);
      setIsTransferring(false);
      form.reset();
    }
  }, [open, form]);

  // Render transfer progress
  const TransferProgress = () => {
    if (steps.length === 0) return null;

    const allCompleted = steps.every((s) => s.status === "completed");
    const hasErrors = steps.some((s) => s.status === "error");

    return (
      <div className="space-y-4 py-4">
        <Alert>
          <AlertDescription>
            {isTransferring
              ? "Transferring ownership of all pool contracts..."
              : allCompleted
              ? "All contracts have been transferred successfully!"
              : hasErrors
              ? "Some transfers failed. Please check the details below."
              : "Transfer process completed with some issues."}
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg border"
            >
              {step.status === "pending" && (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              {step.status === "in_progress" && (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              )}
              {step.status === "completed" && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
              {step.status === "error" && (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}

              <div className="flex-1">
                <p className="font-medium text-sm">{step.name}</p>
                {step.txHash && (
                  <p className="text-xs text-muted-foreground">
                    TX: {step.txHash.slice(0, 10)}...{step.txHash.slice(-8)}
                  </p>
                )}
                {step.error && (
                  <p className="text-xs text-red-600">{step.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {!isTransferring && (
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        )}
      </div>
    );
  };

  // Form Component
  const FormState = () => {
    if (isTransferring || steps.length > 0) {
      return <TransferProgress />;
    }

    if (!isOwner) {
      return (
        <div className="space-y-4 text-center py-4">
          <p className="text-muted-foreground">
            You must be an owner of this pool contract to transfer ownership.
          </p>
          <p className="text-sm text-muted-foreground">
            Please connect with an owner wallet to perform this action.
          </p>
        </div>
      );
    }

    return (
      <>
        <Alert className="mb-4">
          <AlertDescription>
            This will transfer ownership of the following contracts:
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>SwapPool Contract</li>
              <li>Token Registry</li>
              <li>Token Limiter</li>
              <li>Quoter Contract</li>
            </ul>
            <p className="mt-2 text-xs">
              <strong>Note:</strong> If the pool is owned by a multisig wallet,
              all transfers will be batched into a single transaction for
              approval by other signers.
            </p>
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form className="space-y-4 py-4">
            <AddressField
              form={form}
              name="newOwner"
              label="New Owner"
              placeholder="Address, ENS Name or Phone number"
              description="The address that will become the new owner of all pool contracts"
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
            description="Are you sure you want to transfer ownership of this pool and all its sub-contracts to the new owner? This action cannot be undone."
            onYes={() => void form.handleSubmit(handleTransferOwnership)()}
            disabled={!address || !form.formState.isValid}
          />
        </div>
      </>
    );
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isTransferring) {
          setOpen(isOpen);
        }
      }}
      button={button}
      title="Transfer Pool Ownership"
      description={
        !isTransferring && steps.length === 0 && !proposalHash
          ? "Transfer ownership of the pool and all its sub-contracts."
          : ""
      }
    >
      {proposalHash ? (
        <SuccessState
          title="Batch Transaction Proposed for Multisig Approval"
          description="A batch transaction containing all ownership transfers (SwapPool, Token Registry, Token Limiter, and Quoter) has been submitted to the Gnosis Safe service. Other owners must approve before execution. Once approved and executed, all contracts will transfer ownership atomically."
          onClose={() => setOpen(false)}
        />
      ) : (
        <FormState />
      )}
    </ResponsiveModal>
  );
}
