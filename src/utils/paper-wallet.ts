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
  private storage: Storage;

  private constructor(
    qrCodeContent: PaperWalletQRCodeContent,
    storage: Storage = sessionStorage
  ) {
    this.qrCodeContent = qrCodeContent;
    this.storage = storage;
    this.isEncrypted = "encryptedContent" in this.qrCodeContent;
    this.saveToSessionStorage();
  }
  static async initialize(text: string, storage: Storage = sessionStorage) {
    const qrCodeContent = await this.parseQRCodeText(text);
    return new PaperWallet(qrCodeContent, storage);
  }

  private static async parseQRCodeText(
    text: string
  ): Promise<PaperWalletQRCodeContent> {
    if (text.length === 66) {
      const privateKey = text;
      if (!privateKey.startsWith("0x")) throw new Error("Invalid private key");
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      return {
        address: account.address,
        privateKey: privateKey,
      } as PlainPaperWallet;
    }

    if (text.length === 220) {
      const encryptedContent = text.slice(0, 164);
      const iv = text.slice(164, 188);
      const salt = text.slice(188, 220);
      const password = await createPasswordEntryModal();
      if (!password) throw new Error("Password entry cancelled");
      const decryptedKey = (await decryptPrivateKey(
        hexToUint8Array(encryptedContent).buffer,
        hexToUint8Array(salt),
        hexToUint8Array(iv),
        password
      )) as `0x${string}`;
      const account = privateKeyToAccount(decryptedKey);
      return {
        address: account.address,
        encryptedContent: encryptedContent,
        salt: salt,
        iv: iv,
      } as EncryptedPaperWallet;
    }
    try {
      const data = JSON.parse(text) as unknown;
      if (!this.isValidQRCodeContent(data)) {
        throw new Error("Invalid Wallet QR Code");
      }
      return data;
    } catch (error) {
      throw new Error("Invalid Wallet QR Code format");
    }
  }

  private static isValidQRCodeContent(
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
    this.storage.setItem(
      PAPER_WALLET_SESSION_KEY,
      JSON.stringify(this.qrCodeContent)
    );
  }

  public static loadFromSessionStorage(
    storage: Storage = sessionStorage
  ): PaperWallet | undefined {
    const storedData = storage.getItem(PAPER_WALLET_SESSION_KEY);
    if (!storedData) return;
    const data = JSON.parse(storedData) as unknown;
    if (!this.isValidQRCodeContent(data)) {
      throw new Error("Invalid Wallet QR Code");
    }
    return new PaperWallet(data, storage);
  }

  public static removeFromSessionStorage(
    storage: Storage = sessionStorage
  ): void {
    storage.removeItem(PAPER_WALLET_SESSION_KEY);
  }

  public static async fromQRCode(): Promise<PaperWallet> {
    const text = await createAccountScannerModal();
    if (!text) throw new Error("QR code scanning cancelled");
    return PaperWallet.initialize(text);
  }
}
