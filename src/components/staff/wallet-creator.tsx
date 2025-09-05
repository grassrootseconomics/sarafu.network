"use client";

import { ArrowLeftIcon, WalletIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ProfileForm } from "~/components/users/forms/profile-form";
import { CUSD_TOKEN_ADDRESS } from "~/lib/contacts";
import { EncryptedWalletForm } from "./encrypted-wallet-form";
import { ErrorDisplay } from "./error-display";
import { NFCOverwriteDialog } from "./nfc-overwrite-dialog";
import { PaperWalletDisplay } from "./paper-wallet-display";
import { WalletCreationStatus } from "./wallet-creation-status";
import { WalletCreationSteps } from "./wallet-creation-steps";
import { WalletEncryptionSelector } from "./wallet-encryption-selector";
import { WalletMediumSelector } from "./wallet-medium-selector";
import { WalletSummary } from "./wallet-summary";
import { useWalletCreationContext, WalletCreationProvider } from "./wallet-creation-context";

function WalletCreatorContent() {
  const {
    selectedMedium,
    selectedEncryption,
    showProfileForm,
    showPasswordForm,
    showOverwriteDialog,
    existingNfcData,
    currentStep,
    createdWallet,
    isCreating,
    walletError,
    nfcStatus,
    nfcError,
    handleProfileSubmit,
    handleBack,
    handleReset,
    handleWriteToNFC,
    handleConfirmOverwrite,
    handleCancelOverwrite,
  } = useWalletCreationContext();

  const renderContent = () => {
    // Step 1: Choose medium (Paper or NFC)
    if (!selectedMedium) {
      return <WalletMediumSelector />;
    }

    // Step 2: Choose encryption (Encrypted or None)
    if (!selectedEncryption && !showProfileForm && !showPasswordForm) {
      return <WalletEncryptionSelector />;
    }

    // Step 3: Profile information form
    if (showProfileForm) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Add Profile Information</h3>
            <p className="text-sm text-gray-600">
              Add profile information for the wallet holder (optional)
            </p>
          </div>
          <ProfileForm
            initialValues={{
              given_names: null,
              family_name: null,
              year_of_birth: null,
              location_name: null,
              geo: null,
              default_voucher: CUSD_TOKEN_ADDRESS,
            }}
            onSubmit={handleProfileSubmit}
            buttonLabel="Continue"
            className="max-w-2xl mx-auto"
          />
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          </div>
        </div>
      );
    }

    // Step 4: Password form for encrypted wallets
    if (showPasswordForm) {
      return <EncryptedWalletForm />;
    }

    // Step 5: Progress steps during creation
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
            />
          </div>
        </>
      );
    }

    // Step 5.5: Write failed - show retry option
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
                onClick={handleWriteToNFC}
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

    // Step 6: Completed wallet display
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
  const showBackButton =
    (selectedMedium || showProfileForm || showPasswordForm) && !isCreating && currentStep === "idle";

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

        {/* NFC Overwrite Confirmation Dialog */}
        <NFCOverwriteDialog
          open={showOverwriteDialog}
          onOpenChange={() => {}} // Controlled by context
          onConfirm={handleConfirmOverwrite}
          onCancel={handleCancelOverwrite}
          existingData={existingNfcData}
          newWallet={
            createdWallet
              ? {
                  address: createdWallet.address,
                  ensName: createdWallet.ensName,
                }
              : undefined
          }
        />
      </CardContent>
    </Card>
  );
}

export function WalletCreator() {
  return (
    <WalletCreationProvider>
      <WalletCreatorContent />
    </WalletCreationProvider>
  );
}
