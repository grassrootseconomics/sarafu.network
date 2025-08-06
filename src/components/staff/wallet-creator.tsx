"use client";

import { ArrowLeftIcon, WalletIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { EncryptedWalletForm } from "./encrypted-wallet-form";
import { ErrorDisplay } from "./error-display";
import { PaperWalletDisplay } from "./paper-wallet-display";
import { useNfcWriter } from "./use-nfc-writer";
import { useWalletCreation } from "./use-wallet-creation";
import { WalletCreationStatus } from "./wallet-creation-status";
import { WalletCreationSteps } from "./wallet-creation-steps";
import type { WalletEncryption, WalletMedium } from "./wallet-creation-types";
import { WalletEncryptionSelector } from "./wallet-encryption-selector";
import { WalletMediumSelector } from "./wallet-medium-selector";
import { WalletSummary } from "./wallet-summary";

export function WalletCreator() {
  const [selectedMedium, setSelectedMedium] = useState<WalletMedium | null>(
    null
  );
  const [selectedEncryption, setSelectedEncryption] =
    useState<WalletEncryption | null>(null);
  const [autoApproveGas, setAutoApproveGas] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const {
    currentStep,
    createdWallet,
    createWallet,
    reset,
    setCurrentStep,
    isCreating,
    error: walletError,
  } = useWalletCreation();

  const { nfcStatus, nfcError, writeToNFC, clearData } = useNfcWriter({
    wallet: createdWallet,
    setCurrentStep,
  });

  const handleMediumSelect = (medium: WalletMedium) => {
    setSelectedMedium(medium);
  };

  const handleEncryptionSelect = (
    encryption: WalletEncryption,
    withAutoApprove = false
  ) => {
    setSelectedEncryption(encryption);
    setAutoApproveGas(withAutoApprove);

    if (encryption === "encrypted") {
      setShowPasswordForm(true);
    } else {
      // Create unencrypted wallet immediately
      void handleCreateWallet(encryption, undefined, withAutoApprove);
    }
  };

  const handleCreateWallet = async (
    encryption: WalletEncryption,
    password?: string,
    gasApproval = false
  ) => {
    if (!selectedMedium) return;

    await createWallet({
      medium: selectedMedium,
      encryption,
      password,
      autoApproveGas: gasApproval,
    });

    setShowPasswordForm(false);
  };

  const handlePasswordSubmit = (password: string) => {
    void handleCreateWallet("encrypted", password, autoApproveGas);
  };

  const handleReset = () => {
    reset();
    clearData();
    setSelectedMedium(null);
    setSelectedEncryption(null);
    setAutoApproveGas(false);
    setShowPasswordForm(false);
  };

  const handleBack = () => {
    if (showPasswordForm) {
      setShowPasswordForm(false);
      setSelectedEncryption(null);
    } else if (selectedMedium) {
      setSelectedMedium(null);
      setSelectedEncryption(null);
    }
  };

  const renderContent = () => {
    // Step 1: Choose medium (Paper or NFC)
    if (!selectedMedium) {
      return <WalletMediumSelector onSelect={handleMediumSelect} />;
    }

    // Step 2: Choose encryption (Encrypted or None)
    if (!selectedEncryption && !showPasswordForm) {
      return (
        <WalletEncryptionSelector
          medium={selectedMedium}
          onSelect={handleEncryptionSelect}
          onBack={handleBack}
        />
      );
    }

    // Step 3: Password form for encrypted wallets
    if (showPasswordForm) {
      return (
        <EncryptedWalletForm
          onSubmit={handlePasswordSubmit}
          onCancel={handleBack}
          isSubmitting={isCreating}
        />
      );
    }

    // Step 4: Progress steps during creation
    if (
      currentStep !== "idle" &&
      currentStep !== "completed" &&
      currentStep !== "write-failed"
    ) {
      return (
        <>
          <WalletCreationSteps
            currentStep={currentStep}
            walletType={selectedMedium === "paper" ? "paper-encrypted" : "nfc"}
          />
          <div className="text-center space-y-2">
            <WalletCreationStatus
              currentStep={currentStep}
              isCreating={isCreating}
              nfcSupported={nfcStatus.isSupported}
              onCreateWallet={() => {}} // Not used in this flow
              onWriteToNFC={writeToNFC}
              hasNfcData={!!createdWallet?.url}
            />
          </div>
        </>
      );
    }

    // Step 4.5: Write failed - show retry option
    if (currentStep === "write-failed" && createdWallet) {
      return (
        <>
          <WalletCreationSteps currentStep="writing" walletType="nfc" />
          <div className="text-center space-y-4">
            <div className="text-red-600 font-medium">
              Failed to write to NFC chip
            </div>
            <div className="space-x-4">
              <Button
                onClick={writeToNFC}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Retry NFC Write
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Start Over
              </Button>
            </div>
          </div>
        </>
      );
    }

    // Step 5: Completed wallet display
    if (createdWallet) {
      if (selectedMedium === "nfc") {
        return (
          <>
            <WalletCreationSteps currentStep={currentStep} walletType="nfc" />
            <WalletSummary wallet={createdWallet} onReset={handleReset} />
          </>
        );
      } else if (selectedMedium === "paper" && createdWallet) {
        return (
          <PaperWalletDisplay wallet={createdWallet} onReset={handleReset} />
        );
      }
    }

    return null;
  };
  console.log(currentStep, createdWallet);
  const showBackButton =
    selectedMedium && !isCreating && currentStep === "idle";

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WalletIcon className="w-5 h-5" />
          Wallet Creator
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="ml-auto"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderContent()}

        {/* Error Display */}
        <ErrorDisplay errors={[nfcError, walletError]} />

        {/* NFC Status - only show for NFC wallets */}
        {selectedMedium === "nfc" && (
          <div className="text-xs text-gray-500 text-center">
            NFC Status: {nfcStatus.message || "Unknown"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
