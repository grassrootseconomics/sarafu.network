import * as SecureStore from "expo-secure-store";
import {
  generateMnemonic,
  mnemonicToAccount,
  privateKeyToAccount,
  english,
} from "viem/accounts";
import type { Hex, PrivateKeyAccount } from "viem";

const STORE_KEYS = {
  mnemonic: "sarafu_mnemonic",
  privateKey: "sarafu_private_key",
  address: "sarafu_auth_address",
} as const;

// ETH-compatible BIP44 path — used by MetaMask, Valora, etc. for Celo
const DERIVATION_PATH = "m/44'/60'/0'/0/0" as const;

export interface WalletInfo {
  address: Hex;
  hasWallet: true;
}

/**
 * Generate a new 12-word HD wallet and derive the first account.
 * Returns the mnemonic and derived address (does NOT persist — call storeWallet after verification).
 */
export function generateWallet(): {
  mnemonic: string;
  address: Hex;
  privateKey: Hex;
} {
  const mnemonic = generateMnemonic(english);
  const account = mnemonicToAccount(mnemonic, {
    path: DERIVATION_PATH,
  });
  return {
    mnemonic,
    address: account.address as Hex,
    privateKey: account.getHdKey().privateKey
      ? (`0x${Buffer.from(account.getHdKey().privateKey!).toString("hex")}` as Hex)
      : (() => {
          throw new Error("Failed to derive private key");
        })(),
  };
}

/**
 * Validate a mnemonic and derive the account from it.
 */
export function deriveFromMnemonic(mnemonic: string): {
  mnemonic: string;
  address: Hex;
  privateKey: Hex;
} {
  const normalized = mnemonic.trim().toLowerCase().replace(/\s+/g, " ");
  const words = normalized.split(" ");
  if (words.length !== 12 && words.length !== 24) {
    throw new Error("Mnemonic must be 12 or 24 words");
  }
  // mnemonicToAccount validates internally and throws if invalid
  const account = mnemonicToAccount(normalized, {
    path: DERIVATION_PATH,
  });
  const hdKey = account.getHdKey();
  if (!hdKey.privateKey) {
    throw new Error("Failed to derive private key");
  }
  return {
    mnemonic: normalized,
    address: account.address as Hex,
    privateKey: `0x${Buffer.from(hdKey.privateKey).toString("hex")}` as Hex,
  };
}

/**
 * Persist wallet credentials to secure store.
 */
export async function storeWallet(
  mnemonic: string,
  privateKey: Hex,
  address: Hex
) {
  await Promise.all([
    SecureStore.setItemAsync(STORE_KEYS.mnemonic, mnemonic),
    SecureStore.setItemAsync(STORE_KEYS.privateKey, privateKey),
    SecureStore.setItemAsync(STORE_KEYS.address, address),
  ]);
}

/**
 * Load wallet info from secure store. Returns null if no wallet exists.
 */
export async function loadWallet(): Promise<WalletInfo | null> {
  const address = await SecureStore.getItemAsync(STORE_KEYS.address);
  if (!address) return null;
  return { address: address as Hex, hasWallet: true };
}

/**
 * Load the stored mnemonic. Requires biometric/PIN verification first in the UI.
 */
export async function loadMnemonic(): Promise<string | null> {
  return SecureStore.getItemAsync(STORE_KEYS.mnemonic);
}

/**
 * Get a viem PrivateKeyAccount for signing transactions and messages.
 */
export async function getAccount(): Promise<PrivateKeyAccount | null> {
  const privateKey = await SecureStore.getItemAsync(STORE_KEYS.privateKey);
  if (!privateKey) return null;
  return privateKeyToAccount(privateKey as Hex);
}

/**
 * Import wallet from a mnemonic phrase. Validates, derives, and stores.
 */
export async function importWallet(mnemonic: string): Promise<WalletInfo> {
  const { mnemonic: normalized, privateKey, address } =
    deriveFromMnemonic(mnemonic);
  await storeWallet(normalized, privateKey, address);
  return { address, hasWallet: true };
}

/**
 * Delete all wallet data from secure store.
 */
export async function deleteWallet() {
  await Promise.all([
    SecureStore.deleteItemAsync(STORE_KEYS.mnemonic),
    SecureStore.deleteItemAsync(STORE_KEYS.privateKey),
    SecureStore.deleteItemAsync(STORE_KEYS.address),
  ]);
}
