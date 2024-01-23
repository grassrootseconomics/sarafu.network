import { isAddress, type PrivateKeyAccount } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
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

export class PaperWallet {
  public qrCodeContent: PaperWalletQRCodeContent;
  public isEncrypted: boolean;

  constructor(private text: string, private storage: Storage = sessionStorage) {
    this.qrCodeContent = this.parseQRCodeText();
    this.isEncrypted = "encryptedContent" in this.qrCodeContent;
    this.saveToSessionStorage();
  }

  private parseQRCodeText(): PaperWalletQRCodeContent {
    try {
      const data = JSON.parse(this.text) as unknown;
      if (!this.isValidQRCodeContent(data)) {
        throw new Error("Invalid Wallet QR Code");
      }
      return data;
    } catch (error) {
      throw new Error("Invalid Wallet QR Code format");
    }
  }

  private isValidQRCodeContent(
    data: unknown
  ): data is PaperWalletQRCodeContent {
    // Check if data is an object
    if (typeof data !== "object" || data === null) {
      return false;
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

    const isPlainWallet =
      typeof potentialData.address === "string" &&
      isAddress(potentialData.address) &&
      typeof potentialData.privateKey === "string";

    return isEncryptedWallet || isPlainWallet;
  }

  public getAddress(): `0x${string}` {
    return this.qrCodeContent.address;
  }

  public async getAccount(): Promise<PrivateKeyAccount> {
    if (!this.isEncrypted) {
      const privateKey = await this.getPrivateKey();
      return privateKeyToAccount(privateKey);
    }
    const password = await createPasswordEntryModal();
    if (!password) throw new Error("Password entry cancelled");

    try {
      const privateKey = await this.getPrivateKey(password);
      return privateKeyToAccount(privateKey);
    } catch (error) {
      throw new Error("Failed to decrypt private key with provided password");
    }
  }

  public async getPrivateKey(password?: string): Promise<`0x${string}`> {
    if ("privateKey" in this.qrCodeContent) {
      return this.qrCodeContent.privateKey as `0x${string}`;
    }
    if (!password) throw new Error("No password provided");
    const { encryptedContent, salt, iv } = this.qrCodeContent;
    const decryptedKey = await decryptPrivateKey(
      hexToUint8Array(encryptedContent).buffer,
      hexToUint8Array(salt),
      hexToUint8Array(iv),
      password
    );
    return decryptedKey as `0x${string}`;
  }

  public static async generate(
    password?: string
  ): Promise<PaperWalletQRCodeContent> {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    if (!password) {
      return {
        address: account.address,
        privateKey: privateKey,
      } as PlainPaperWallet;
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
    };
  }

  public saveToSessionStorage(): void {
    this.storage.setItem(
      PAPER_WALLET_SESSION_KEY,
      JSON.stringify(this.qrCodeContent)
    );
  }

  public static loadFromSessionStorage(
    storage: Storage = sessionStorage
  ): PaperWallet | null {
    const storedData = storage.getItem(PAPER_WALLET_SESSION_KEY);
    return storedData ? new PaperWallet(storedData, storage) : null;
  }

  public static removeFromSessionStorage(
    storage: Storage = sessionStorage
  ): void {
    storage.removeItem(PAPER_WALLET_SESSION_KEY);
  }

  public static async fromQRCode(): Promise<PaperWallet> {
    const text = await createAccountScannerModal();
    if (!text) throw new Error("QR code scanning cancelled");
    return new PaperWallet(text);
  }
}
