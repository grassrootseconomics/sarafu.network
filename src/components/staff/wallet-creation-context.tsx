"use client";

import { createContext, useContext, useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { type UserProfileFormType } from "~/components/users/forms/profile-form";
import { useWalletCreation } from "./use-wallet-creation";
import { useNfcWriter } from "./use-nfc-writer";
import type { WalletEncryption, WalletMedium, CreatedWallet, WalletCreationStep } from "./wallet-creation-types";

interface WalletCreationState {
  // Selection state
  selectedMedium: WalletMedium | null;
  selectedEncryption: WalletEncryption | null;
  profileData: UserProfileFormType | null;
  autoApproveGas: boolean;
  
  // UI state
  showProfileForm: boolean;
  showPasswordForm: boolean;
  showOverwriteDialog: boolean;
  existingNfcData: string | undefined;
  
  // Wallet creation state
  currentStep: WalletCreationStep;
  createdWallet: CreatedWallet | null;
  isCreating: boolean;
  walletError: string | undefined;
  
  // NFC state
  nfcStatus: {
    isSupported: boolean;
    message?: string;
  };
  nfcError: string;
}

interface WalletCreationActions {
  // Selection actions
  setSelectedMedium: (medium: WalletMedium | null) => void;
  setSelectedEncryption: (encryption: WalletEncryption | null) => void;
  setProfileData: (data: UserProfileFormType | null) => void;
  setAutoApproveGas: (approve: boolean) => void;
  
  // UI actions
  setShowProfileForm: (show: boolean) => void;
  setShowPasswordForm: (show: boolean) => void;
  setShowOverwriteDialog: (show: boolean) => void;
  setExistingNfcData: (data: string | undefined) => void;
  
  // Workflow actions
  handleMediumSelect: (medium: WalletMedium) => void;
  handleEncryptionSelect: (encryption: WalletEncryption, withAutoApprove?: boolean) => void;
  handleProfileSubmit: (data: UserProfileFormType) => void;
  handlePasswordSubmit: (password: string) => void;
  handleCreateWallet: (
    encryption: WalletEncryption,
    password?: string,
    gasApproval?: boolean,
    profile?: UserProfileFormType
  ) => Promise<void>;
  handleBack: () => void;
  handleReset: () => void;
  
  // NFC actions
  handleWriteToNFC: () => Promise<void>;
  handleConfirmOverwrite: () => Promise<void>;
  handleCancelOverwrite: () => void;
  
  // Internal actions
  setCurrentStep: (step: WalletCreationStep) => void;
}

type WalletCreationContextType = WalletCreationState & WalletCreationActions;

const WalletCreationContext = createContext<WalletCreationContextType | null>(null);

interface WalletCreationProviderProps {
  children: ReactNode;
}

export function WalletCreationProvider({ children }: WalletCreationProviderProps) {
  // Selection state
  const [selectedMedium, setSelectedMedium] = useState<WalletMedium | null>(null);
  const [selectedEncryption, setSelectedEncryption] = useState<WalletEncryption | null>(null);
  const [profileData, setProfileData] = useState<UserProfileFormType | null>(null);
  const [autoApproveGas, setAutoApproveGas] = useState(false);
  
  // UI state
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [existingNfcData, setExistingNfcData] = useState<string | undefined>();
  
  const hasTriggeredWriteRef = useRef(false);

  // Wallet creation hook
  const {
    currentStep,
    createdWallet,
    createWallet,
    reset,
    setCurrentStep,
    isCreating,
    error: walletError,
  } = useWalletCreation();

  // NFC writer hook
  const { nfcStatus, nfcError, writeToNFC, checkExistingData, clearData } = useNfcWriter({
    wallet: createdWallet,
    setCurrentStep,
  });

  const handleWriteToNFC = useCallback(async () => {
    const checkResult = await checkExistingData();

    if (checkResult.hasData) {
      setExistingNfcData(checkResult.data);
      setShowOverwriteDialog(true);
    } else {
      await writeToNFC();
    }
  }, [checkExistingData, writeToNFC, setExistingNfcData, setShowOverwriteDialog]);

  // Auto-trigger NFC writing when step becomes "writing" (only once per wallet creation)
  useEffect(() => {
    if (
      currentStep === "writing" &&
      createdWallet &&
      selectedMedium === "nfc" &&
      !hasTriggeredWriteRef.current
    ) {
      hasTriggeredWriteRef.current = true;
      void handleWriteToNFC();
    }
  }, [currentStep, createdWallet, selectedMedium, handleWriteToNFC]);

  // Reset the trigger flag when resetting
  useEffect(() => {
    if (currentStep === "idle") {
      hasTriggeredWriteRef.current = false;
    }
  }, [currentStep]);

  // Workflow actions
  const handleMediumSelect = (medium: WalletMedium) => {
    setSelectedMedium(medium);
  };

  const handleEncryptionSelect = (
    encryption: WalletEncryption,
    withAutoApprove = false
  ) => {
    setSelectedEncryption(encryption);
    setAutoApproveGas(withAutoApprove);

    // Always show profile form after encryption selection
    setShowProfileForm(true);
  };

  const handleProfileSubmit = (data: UserProfileFormType) => {
    setProfileData(data);
    setShowProfileForm(false);

    if (selectedEncryption === "encrypted") {
      setShowPasswordForm(true);
    } else if (selectedEncryption) {
      // Create unencrypted wallet immediately
      void handleCreateWallet(selectedEncryption, undefined, autoApproveGas, data);
    }
  };

  const handleCreateWallet = async (
    encryption: WalletEncryption,
    password?: string,
    gasApproval = false,
    profile?: UserProfileFormType
  ) => {
    if (!selectedMedium) return;

    await createWallet({
      medium: selectedMedium,
      encryption,
      password,
      autoApproveGas: gasApproval,
      profileData: profile ?? profileData ?? undefined,
    });

    setShowPasswordForm(false);
  };

  const handlePasswordSubmit = (password: string) => {
    void handleCreateWallet("encrypted", password, autoApproveGas, profileData ?? undefined);
  };

  const handleConfirmOverwrite = async () => {
    await writeToNFC();
  };

  const handleCancelOverwrite = () => {
    setShowOverwriteDialog(false);
    void handleWriteToNFC();
  };

  const handleReset = () => {
    reset();
    clearData();
    setSelectedMedium(null);
    setSelectedEncryption(null);
    setProfileData(null);
    setShowProfileForm(false);
    setAutoApproveGas(false);
    setShowPasswordForm(false);
    setShowOverwriteDialog(false);
    setExistingNfcData(undefined);
  };

  const handleBack = () => {
    if (showPasswordForm) {
      setShowPasswordForm(false);
      setShowProfileForm(true);
    } else if (showProfileForm) {
      setShowProfileForm(false);
      setSelectedEncryption(null);
    } else if (selectedMedium) {
      setSelectedMedium(null);
      setSelectedEncryption(null);
    }
  };

  const contextValue: WalletCreationContextType = {
    // State
    selectedMedium,
    selectedEncryption,
    profileData,
    autoApproveGas,
    showProfileForm,
    showPasswordForm,
    showOverwriteDialog,
    existingNfcData,
    currentStep,
    createdWallet,
    isCreating,
    walletError: walletError ?? undefined,
    nfcStatus,
    nfcError,
    
    // Actions
    setSelectedMedium,
    setSelectedEncryption,
    setProfileData,
    setAutoApproveGas,
    setShowProfileForm,
    setShowPasswordForm,
    setShowOverwriteDialog,
    setExistingNfcData,
    handleMediumSelect,
    handleEncryptionSelect,
    handleProfileSubmit,
    handlePasswordSubmit,
    handleCreateWallet,
    handleBack,
    handleReset,
    handleWriteToNFC,
    handleConfirmOverwrite,
    handleCancelOverwrite,
    setCurrentStep,
  };

  return (
    <WalletCreationContext.Provider value={contextValue}>
      {children}
    </WalletCreationContext.Provider>
  );
}

export function useWalletCreationContext(): WalletCreationContextType {
  const context = useContext(WalletCreationContext);
  if (!context) {
    throw new Error("useWalletCreationContext must be used within a WalletCreationProvider");
  }
  return context;
}