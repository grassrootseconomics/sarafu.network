"use client";

import { NfcIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { WalletCreationStep } from "./wallet-creation-types";

interface WalletCreationStatusProps {
  currentStep: WalletCreationStep;
  isCreating: boolean;
  nfcSupported: boolean;
  onCreateWallet: () => void;
}

export function WalletCreationStatus({
  currentStep,
  isCreating,
  nfcSupported,
  onCreateWallet,
}: WalletCreationStatusProps) {
  if (currentStep === "idle") {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">
          Ready to create a new wallet with NFC support
        </p>
        <Button
          onClick={onCreateWallet}
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? "Creating..." : "Create New Wallet"}
        </Button>
      </div>
    );
  }

  if (currentStep === "generating") {
    return (
      <div className="space-y-2">
        <p className="text-blue-600">Generating new wallet...</p>
        <ProgressBar progress={33} />
      </div>
    );
  }

  if (currentStep === "registering") {
    return (
      <div className="space-y-2">
        <p className="text-blue-600">Registering wallet and assigning ENS...</p>
        <ProgressBar progress={66} />
      </div>
    );
  }

  if (currentStep === "writing") {
    return (
      <div className="space-y-4 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-pulse">
            <NfcIcon className="w-16 h-16 my-8 text-orange-500" />
          </div>
          {nfcSupported ? (
            <p className="text-orange-600 font-medium">
              Hold your device near an NFC tag to write...
            </p>
          ) : (
            <p className="text-red-600">NFC not supported on this device</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="animate-pulse">
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
