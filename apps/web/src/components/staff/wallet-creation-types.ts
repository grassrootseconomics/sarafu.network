import { type PaperWalletQRCodeContent } from "~/utils/paper-wallet";
import { type UserProfileFormType } from "~/components/users/forms/profile-form";

export type WalletCreationStep = "idle" | "profile" | "generating" | "registering" | "writing" | "completed" | "write-failed";

export type WalletMedium = "paper" | "nfc";
export type WalletEncryption = "encrypted" | "none";

export interface CreatedWallet {
  address: `0x${string}`;
  privateKey: `0x${string}`;
  ensName: string;
  medium: WalletMedium;
  encryption: WalletEncryption;
  wallet: PaperWalletQRCodeContent;
  url: string;
  password?: string; // For encrypted wallets
  profileData?: UserProfileFormType; // Profile information
}

export interface WalletCreationOptions {
  medium: WalletMedium;
  encryption: WalletEncryption;
  password?: string;
  autoApproveGas?: boolean;
  profileData?: UserProfileFormType;
}