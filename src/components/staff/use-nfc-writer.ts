"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useNFC } from "~/lib/nfc/use-nfc";
import type {
  CreatedWallet,
  WalletCreationStep,
} from "./wallet-creation-types";

interface UseNfcWriterProps {
  wallet: CreatedWallet | null;
  setCurrentStep: (step: WalletCreationStep) => void;
}

export function useNfcWriter({ wallet, setCurrentStep }: UseNfcWriterProps) {
  const { nfcStatus, writeUrlToTag, error: nfcError, clearData } = useNFC();

  const writeToNFC = useCallback(async () => {
    if (!wallet?.url) {
      toast.error("No wallet data available for NFC writing");
      return;
    }

    try {
      setCurrentStep("writing");

      const success = await writeUrlToTag(wallet.url);

      if (success) {
        toast.success("Wallet successfully written to NFC chip!");
        setCurrentStep("completed");
      } else {
        toast.error("Failed to write to NFC chip");
        setCurrentStep("write-failed");
      }
    } catch (error) {
      console.error("NFC writing failed:", error);
      toast.error(`Failed to write due to an IO error: ${error instanceof Error ? error.message : 'null'}`);
      setCurrentStep("write-failed");
    }
  }, [wallet, writeUrlToTag, setCurrentStep]);

  return {
    nfcStatus,
    nfcError,
    writeToNFC,
    clearData,
  };
}
