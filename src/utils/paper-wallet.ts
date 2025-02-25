import { getAddress, isAddress, type PrivateKeyAccount } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { parseEthUrl } from "~/lib/eth-url-parser";
import { createPasswordEntryModal } from "~/lib/paper-connector/pin-modal/view";
import { createAccountScannerModal } from "~/lib/paper-connector/scan-modal/view";
import { decryptPrivateKey, encryptPrivateKey } from "./crypto";

const PAPER_WALLET_SESSION_KEY = "paper-wallet";

// Utility function to convert hex string to Uint8Array
function hexToUint8Array(hexString: string): Uint8Array {
  return new Uint8Array(
    hexString.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []
  );
}

// Types for the content of the QR code of the paper wallet
export type PaperWalletQRCodeContent = EncryptedPaperWallet | PlainPaperWallet;

export type EncryptedPaperWallet = {
  address: `0x${string}`;
  encryptedContent: string;
  salt: string;
  iv: string;
};

export type PlainPaperWallet = {
  address: `0x${string}`;
  privateKey: string;
};
const tryParseEthUrl = (result: string) => {
  try {
    const ethUrlResult = parseEthUrl(result);
    if (ethUrlResult && ethUrlResult.target_address) {
      return getAddress(ethUrlResult.target_address);
    }
  } catch (error) {
    console.error("Error parsing ETH URL:", error);
  }
  return undefined;
};
const tryParseJson = (result: string) => {
  try {
    const jsonResult = JSON.parse(result) as { address?: string };
    if (jsonResult.address && isAddress(jsonResult.address)) {
      return getAddress(jsonResult.address);
    }
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
  return undefined;
};
const tryParseAddress = (result: string) => {
  try {
    if (isAddress(result)) {
      return getAddress(result);
    }
  } catch (error) {
    console.error("Error parsing address:", error);
  }
  return undefined;
};
const tryAddressFromV2QRContent = (result: string) => {
  try {
    if (result.length === 66 && result.startsWith("0x")) {
      const account = privateKeyToAccount(result as `0x${string}`);
      return getAddress(account.address);
    }
    if (result.length === 262) {
      const address = result.slice(0, 42);
      return getAddress(address);
    }
  } catch (error) {
    console.error("Error parsing address:", error);
  }
  return undefined;
};
const baseURL = "https://sarafu.network/login?w=";
export function toQRContent(wallet: PaperWalletQRCodeContent): string {
  if ("privateKey" in wallet) return `${baseURL}${wallet.privateKey}`;
  const encryptedAccount = `${baseURL}${wallet.address}${wallet.encryptedContent}${wallet.iv}${wallet.salt}`;
  return encryptedAccount;
}
export function fromQRContent(text: string): PaperWalletQRCodeContent {
  if (text.startsWith(baseURL)) {
    text = text.replace(baseURL, "");
  }
  try {
    if (text.length === 66) {
      const wallet = parseV2Plain(text);
      return wallet;
    }
    if (text.length === 262) {
      return parseV2Encrypted(text);
    }
    return parseV1Wallet(text);
  } catch (error) {
    throw new Error("Invalid Wallet QR Code format");
  }
}

export function addressFromQRContent(text: string): `0x${string}` {
  let address: `0x${string}` | undefined;
  if (text.startsWith(baseURL)) {
    text = text.replace(baseURL, "");
  }
  address = tryParseEthUrl(text);
  if (!address) {
    address = tryParseJson(text);
  }
  if (!address) {
    address = tryParseAddress(text);
  }
  if (!address) {
    address = tryAddressFromV2QRContent(text);
  }
  if (address) {
    return address;
  } else {
    throw new Error("Invalid address");
  }
}

function parseV1Wallet(text: string): PaperWalletQRCodeContent {
  const data = JSON.parse(text) as unknown;
  // Check if data is an object
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid Wallet QR Code");
  }

  // Now it's safe to cast data to an object with potential properties
  const potentialData = data as Partial<
    EncryptedPaperWallet & PlainPaperWallet
  >;

  // Check for the presence and types of the properties
  const isEncryptedWallet =
    typeof potentialData.address === "string" &&
    isAddress(potentialData.address) &&
    typeof potentialData.encryptedContent === "string" &&
    typeof potentialData.salt === "string" &&
    typeof potentialData.iv === "string";

  if (isEncryptedWallet) return potentialData as EncryptedPaperWallet;
  const isPlainWallet =
    typeof potentialData.address === "string" &&
    isAddress(potentialData.address) &&
    typeof potentialData.privateKey === "string";

  if (isPlainWallet) return potentialData as PlainPaperWallet;
  throw new Error("Invalid Wallet QR Code");
}

function parseV2Plain(text: string): PlainPaperWallet {
  const privateKey = text;
  if (!privateKey.startsWith("0x")) throw new Error("Invalid private key");
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  return {
    address: account.address,
    privateKey: privateKey,
  } as PlainPaperWallet;
}
function parseV2Encrypted(text: string): EncryptedPaperWallet {
  const address = getAddress(text.slice(0, 42));
  const encryptedContent = text.slice(42, 206);
  const iv = text.slice(206, 230);
  const salt = text.slice(230, 262);
  return {
    address: address,
    encryptedContent: encryptedContent,
    salt: salt,
    iv: iv,
  } as EncryptedPaperWallet;
}
export class PaperWallet {
  public wallet: PaperWalletQRCodeContent;
  public isEncrypted: boolean;
  private storage: Storage;

  constructor(text: string, storage: Storage = sessionStorage) {
    const wallet = fromQRContent(text);
    this.wallet = wallet;
    this.storage = storage;
    this.isEncrypted = "encryptedContent" in this.wallet;
    this.saveToSessionStorage();
  }

  public getAddress(): `0x${string}` {
    return this.wallet.address;
  }

  public async getAccount(): Promise<PrivateKeyAccount> {
    try {
      const privateKey = await this.getPrivateKey();
      return privateKeyToAccount(privateKey);
    } catch (error) {
      throw new Error("Failed to decrypt wallet with provided password");
    }
  }

  public async getPrivateKey(): Promise<`0x${string}`> {
    if ("privateKey" in this.wallet) {
      return this.wallet.privateKey as `0x${string}`;
    }
    const password = await createPasswordEntryModal();
    if (!password) throw new Error("Password entry cancelled");

    const { encryptedContent, salt, iv } = this.wallet;
    try {
      const decryptedKey = await decryptPrivateKey(
        hexToUint8Array(encryptedContent).buffer,
        hexToUint8Array(salt),
        hexToUint8Array(iv),
        password
      );
      return decryptedKey as `0x${string}`;
    } catch (error) {
      throw new Error("Failed to decrypt wallet with provided password");
    }
  }

  public static async generate<P extends string | undefined>(
    password?: P
  ): Promise<P extends string ? EncryptedPaperWallet : PlainPaperWallet> {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    if (typeof password !== "string") {
      return {
        address: account.address,
        privateKey: privateKey,
      } as P extends string ? EncryptedPaperWallet : PlainPaperWallet;
    }

    const encryptedKey = await encryptPrivateKey(privateKey, password);
    const bufferToHexString = (buffer: Uint8Array) =>
      buffer.reduce(
        (str, byte) => str + byte.toString(16).padStart(2, "0"),
        ""
      );

    return {
      address: account.address,
      encryptedContent: bufferToHexString(
        new Uint8Array(encryptedKey.encryptedContent)
      ),
      salt: bufferToHexString(encryptedKey.salt),
      iv: bufferToHexString(encryptedKey.iv),
    } as P extends string ? EncryptedPaperWallet : PlainPaperWallet;
  }

  public saveToSessionStorage(): void {
    this.storage.setItem(PAPER_WALLET_SESSION_KEY, JSON.stringify(this.wallet));
  }

  public static loadFromSessionStorage(
    storage: Storage = sessionStorage
  ): PaperWallet | undefined {
    const storedData = storage.getItem(PAPER_WALLET_SESSION_KEY);
    if (!storedData) return;
    return new PaperWallet(storedData, storage);
  }

  public static removeFromSessionStorage(
    storage: Storage = sessionStorage
  ): void {
    storage.removeItem(PAPER_WALLET_SESSION_KEY);

    // Also clear any related data that might be persisting
    if (typeof window !== "undefined") {
      // Clear any wagmi connection data related to paper wallet
      const keys = Object.keys(storage);
      for (const key of keys) {
        if (
          key.includes("paper") ||
          key.includes("wallet") ||
          key.includes("connect")
        ) {
          storage.removeItem(key);
        }
      }
    }
  }

  public static async fromQRCode(): Promise<PaperWallet> {
    const text = await createAccountScannerModal();
    if (!text) throw new Error("QR code scanning cancelled");
    return new PaperWallet(text);
  }
}
