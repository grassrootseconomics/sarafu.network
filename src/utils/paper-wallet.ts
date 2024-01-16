import { isAddress, type PrivateKeyAccount } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createPasswordEntryModal } from "~/lib/paper-connector/pin-modal/view";
import { createAccountScannerModal } from "~/lib/paper-connector/scan-modal/view";
import { decryptPrivateKey, encryptPrivateKey } from "./crypto";

const PAPER_WALLET_SESSION_KEY = "paper-wallet";

// Utility function to convert hex string to Uint8Array
function hexToUint8Array(hexString: string): Uint8Array {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Type for the content of the QR code of the paper wallet
export type PaperWalletQRCodeContent = {
  address: `0x${string}`;
  encryptedContent: string;
  salt: string;
  iv: string;
};

export class PaperWallet {
  public qrCodeContent: PaperWalletQRCodeContent;

  constructor(private text: string, private storage: Storage = sessionStorage) {
    this.qrCodeContent = this.parseQRCodeText();
    this.saveToSessionStorage();
  }

  private parseQRCodeText(): PaperWalletQRCodeContent {
    try {
      const data = JSON.parse(this.text) as unknown;
      console.log(data);
      if (!this.isValidQRCodeContent(data)) {
        throw new Error("Invalid Wallet QR Code");
      }
      return data;
    } catch (error) {
      throw new Error("Invalid Wallet QR Code");
    }
  }

  private isValidQRCodeContent(
    data: unknown
  ): data is PaperWalletQRCodeContent {
    const potentialData = data as Partial<PaperWalletQRCodeContent>;
    return (
      typeof potentialData === "object" &&
      potentialData !== null &&
      potentialData.address !== undefined &&
      isAddress(potentialData.address) &&
      typeof potentialData.address === "string" &&
      typeof potentialData.encryptedContent === "string" &&
      typeof potentialData.salt === "string" &&
      typeof potentialData.iv === "string"
    );
  }

  public getAddress(): `0x${string}` {
    return this.qrCodeContent.address;
  }

  public async getAccount(): Promise<PrivateKeyAccount> {
    const password = await createPasswordEntryModal();
    if (!password) throw new Error("No password");
    try {
      const privateKey = await this.decryptQRPrivateKey(password);
      return privateKeyToAccount(privateKey);
    } catch (error) {
      throw new Error("Invalid password");
    }
  }

  public async decryptQRPrivateKey(password: string): Promise<`0x${string}`> {
    const content = hexToUint8Array(this.qrCodeContent.encryptedContent).buffer;
    const salt = hexToUint8Array(this.qrCodeContent.salt);
    const iv = hexToUint8Array(this.qrCodeContent.iv);
    const decryptedKey = await decryptPrivateKey(content, salt, iv, password);
    return decryptedKey as `0x${string}`;
  }

  public static async generate(
    password: string
  ): Promise<PaperWalletQRCodeContent> {
    const privateKey = generatePrivateKey();
    const encryptedKey = await encryptPrivateKey(privateKey, password);
    const account = privateKeyToAccount(privateKey);

    const encryptedContent = Array.from(
      new Uint8Array(encryptedKey.encryptedContent)
    );
    const data = {
      salt: Array.from(encryptedKey.salt)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(""),
      iv: Array.from(encryptedKey.iv)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(""),
      address: account.address,
      encryptedContent: encryptedContent
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(""),
    };
    return data;
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
    if (!storedData) {
      return null;
    }
    return new PaperWallet(storedData, storage);
  }

  public static removeFromSessionStorage(
    storage: Storage = sessionStorage
  ): void {
    storage.removeItem(PAPER_WALLET_SESSION_KEY);
  }

  public static async fromQRCode(): Promise<PaperWallet> {
    const text = await createAccountScannerModal();
    if (!text) throw new Error("No QR code scanned");
    return new PaperWallet(text);
  }
}
