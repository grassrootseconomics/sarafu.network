"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { trpc } from "~/lib/trpc";
import { PaperWallet, toQRContent } from "~/utils/paper-wallet";
import {
  type CreatedWallet,
  type WalletCreationOptions,
  type WalletCreationStep,
} from "./wallet-creation-types";

export function useWalletCreation() {
  const [currentStep, setCurrentStep] = useState<WalletCreationStep>("idle");
  const [createdWallet, setCreatedWallet] = useState<CreatedWallet | null>(
    null
  );

  const createWalletMutation = trpc.staff.createWallet.useMutation();

  const createWallet = useCallback(
    async (options: WalletCreationOptions) => {
      try {
        setCurrentStep("generating");

        // Generate new wallet
        const privateKey = generatePrivateKey();
        const account = privateKeyToAccount(privateKey);
        const address = account.address;

        setCurrentStep("registering");

        // Create wallet in database with optional gas approval and ENS registration
        const result = await createWalletMutation.mutateAsync({
          address,
          autoApproveGas: options.autoApproveGas,
        });

        if (result.success) {
          const paperWallet = await PaperWallet.generate(options.password);
          const wallet: CreatedWallet = {
            address,
            privateKey,
            ensName: result.ensName,
            medium: options.medium,
            encryption: options.encryption,
            password: options.password,
            wallet: paperWallet,
            url: toQRContent(paperWallet),
          };

          setCreatedWallet(wallet);
          toast.success("Wallet created successfully!");

          // Prepare data based on wallet medium
          if (options.medium === "nfc") {
            setCurrentStep("writing");
          } else {
            setCurrentStep("completed");
            setCurrentStep("idle");
            return;
          }
        }
      } catch (error) {
        console.error("Wallet creation failed:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to create wallet"
        );
        setCurrentStep("idle");
      }
    },
    [createWalletMutation]
  );

  const reset = useCallback(() => {
    setCurrentStep("idle");
    setCreatedWallet(null);
  }, []);

  return {
    currentStep,
    createdWallet,
    createWallet,
    reset,
    setCurrentStep,
    isCreating: createWalletMutation.isPending,
    error: createWalletMutation.error?.message,
  };
}
