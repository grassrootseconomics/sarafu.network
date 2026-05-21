/* eslint-disable @typescript-eslint/consistent-type-imports */

import { MockStorage } from "__tests__/__mocks__/storage";
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  EncryptedPaperWallet,
  fromQRContent,
  PaperWallet,
  PlainPaperWallet,
  toQRContent,
} from "~/utils/paper-wallet";

const passwordModalMock = vi.fn(() => Promise.resolve<string | void>("test"));

vi.mock("~/lib/paper-connector/pin-modal/view", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("~/lib/paper-connector/pin-modal/view")
    >();
  return {
    ...actual,
    createPasswordEntryModal: (...args: unknown[]) =>
      (passwordModalMock as unknown as (...a: unknown[]) => Promise<string | void>)(
        ...args,
      ),
  };
});

beforeEach(() => {
  passwordModalMock.mockReset();
  passwordModalMock.mockImplementation(() => Promise.resolve("test"));
});
const mockWalletAddress = "0x63A434cCB9552cAc52844D2C319d3e39b543dc68";
const mockWalletPrivateKey =
  "0x05d45933729c9d413bbd0bc1a34ec252e2e1a5c5359d090524f930fc1cdd24ae";
const mockPlainWalletV1 = {
  address: mockWalletAddress,
  privateKey: mockWalletPrivateKey,
} as PlainPaperWallet;

const mockEncryptedWalletV1 = {
  address: mockWalletAddress,
  encryptedContent:
    "110fa3ad55e363abe6a1c50e7a775279e4bf9062f6fa911342cccd4f4bc130aa628d2d372f548993bc6342dde28fd3e62b48a82531f15a4a76ee0e87e5199b73ff28f0a62b3405f0a4938abc3c85329db22e",
  salt: "d8b878c46d7ae7a64aee45dfe53878bf",
  iv: "73e3c49e68291f5ce6bc9f42",
} as EncryptedPaperWallet;

const mockEncryptedWalletV2 = toQRContent(mockEncryptedWalletV1);
const mockUnencryptedWalletV2 = mockWalletPrivateKey;
describe("PaperWallet", () => {
  test("QRCode Encrypted", async () => {
    const encryptedWallet = await PaperWallet.generate("test");
    const qrCodeText = toQRContent(encryptedWallet);
    expect(qrCodeText.startsWith("https://sarafu.network/login?w=")).toBe(true);
    const parsed = fromQRContent(qrCodeText) as EncryptedPaperWallet;
    expect(parsed.address).toEqual(encryptedWallet.address);
    expect(parsed.encryptedContent).toEqual(encryptedWallet.encryptedContent);
    expect(parsed.salt).toEqual(encryptedWallet.salt);
    expect(parsed.iv).toEqual(encryptedWallet.iv);
  });
  test("QRCode Plain", async () => {
    const plainWallet = (await PaperWallet.generate()) as PlainPaperWallet;
    const qrCodeText = toQRContent(plainWallet);
    expect(qrCodeText.startsWith("https://sarafu.network/login?w=")).toBe(true);
    const parsed = fromQRContent(qrCodeText) as PlainPaperWallet;
    expect(parsed.address).toEqual(plainWallet.address);
    expect(parsed.privateKey).toEqual(plainWallet.privateKey);
  });
  test("Can generate encrypted wallet", async () => {
    const storage = new MockStorage();
    const paperWallet = await PaperWallet.generate("test");
    expect(paperWallet.encryptedContent.length).toMatchInlineSnapshot(`164`);
    expect(paperWallet.address.length).toMatchInlineSnapshot(`42`);
    expect(paperWallet.salt.length).toMatchInlineSnapshot(`32`);
    expect(paperWallet.iv.length).toMatchInlineSnapshot(`24`);
    const wallet = new PaperWallet(JSON.stringify(paperWallet), storage);

    expect(wallet.isEncrypted).toBe(true);
    const pk = await wallet.getPrivateKey();

    // After first successful decrypt the wallet should be promoted to plain
    // form so subsequent signs don't re-prompt for the password.
    expect(wallet.isEncrypted).toBe(false);
    expect("privateKey" in wallet.wallet).toBe(true);

    const sessionWallet = PaperWallet.loadFromStorage(storage);
    expect(sessionWallet?.isEncrypted).toBe(false);
    await expect(sessionWallet?.getPrivateKey()).resolves.toEqual(pk);
  });

  test("Encrypted wallet only prompts for password on first decrypt", async () => {
    const storage = new MockStorage();
    const paperWallet = await PaperWallet.generate("test");
    const wallet = new PaperWallet(JSON.stringify(paperWallet), storage);

    await wallet.getPrivateKey();
    expect(passwordModalMock).toHaveBeenCalledTimes(1);

    // Second call on the same instance and a freshly loaded instance should
    // both reuse the cached plain key without prompting again.
    await wallet.getPrivateKey();
    await PaperWallet.loadFromStorage(storage)?.getPrivateKey();
    expect(passwordModalMock).toHaveBeenCalledTimes(1);
  });

  test("Cancelling the password modal leaves the encrypted blob intact", async () => {
    const storage = new MockStorage();
    const paperWallet = await PaperWallet.generate("test");
    const wallet = new PaperWallet(JSON.stringify(paperWallet), storage);
    passwordModalMock.mockResolvedValueOnce(undefined);

    await expect(wallet.getPrivateKey()).rejects.toThrow(
      /Password entry cancelled/,
    );
    expect(wallet.isEncrypted).toBe(true);
    const reloaded = PaperWallet.loadFromStorage(storage);
    expect(reloaded?.isEncrypted).toBe(true);
  });

  test("Wrong password leaves the encrypted blob intact", async () => {
    const storage = new MockStorage();
    const paperWallet = await PaperWallet.generate("test");
    const wallet = new PaperWallet(JSON.stringify(paperWallet), storage);
    passwordModalMock.mockResolvedValueOnce("not-the-right-password");

    await expect(wallet.getPrivateKey()).rejects.toThrow();
    expect(wallet.isEncrypted).toBe(true);
    const reloaded = PaperWallet.loadFromStorage(storage);
    expect(reloaded?.isEncrypted).toBe(true);
  });

  test("Can generate unencrypted wallet", async () => {
    const storage = new MockStorage();
    const paperWallet = await PaperWallet.generate();
    expect(paperWallet.address.length).toMatchInlineSnapshot(`42`);
    const wallet = new PaperWallet(JSON.stringify(paperWallet), storage);
    expect(wallet.wallet).toEqual(paperWallet);
    const pk = await wallet.getPrivateKey();

    const sessionWallet = PaperWallet.loadFromStorage(storage);
    await expect(sessionWallet?.getPrivateKey()).resolves.toEqual(pk);
  });

  test("Can load v2 encrypted QR code content", async () => {
    const storage = new MockStorage();
    const paperWallet = new PaperWallet(mockEncryptedWalletV2, storage);
    expect(paperWallet.wallet).toEqual(mockEncryptedWalletV1);
    expect(paperWallet.getAddress()).toEqual(mockWalletAddress);
    const sessionWallet = PaperWallet.loadFromStorage(storage);
    await expect(sessionWallet?.getPrivateKey()).resolves.toEqual(
      mockWalletPrivateKey
    );
  });
  test("Can load v2 unencrypted QR code content", async () => {
    const storage = new MockStorage();
    const paperWallet = new PaperWallet(mockUnencryptedWalletV2, storage);
    expect(paperWallet.getAddress()).toEqual(mockWalletAddress);

    const sessionWallet = PaperWallet.loadFromStorage(storage);
    await expect(sessionWallet?.getPrivateKey()).resolves.toEqual(
      mockWalletPrivateKey
    );
  });
  test("Can load v1 unencrypted format", async () => {
    const qrCodeText = JSON.stringify(mockPlainWalletV1);
    const storage = new MockStorage();
    const paperWallet = new PaperWallet(qrCodeText, storage);
    expect(paperWallet.getAddress()).toEqual(mockWalletAddress);

    const sessionWallet = PaperWallet.loadFromStorage(storage);
    await expect(sessionWallet?.getPrivateKey()).resolves.toEqual(
      mockWalletPrivateKey
    );
  });
  test("Can load v1 encrypted format", async () => {
    const storage = new MockStorage();
    const qrCodeText = JSON.stringify(mockEncryptedWalletV1);
    const paperWallet = new PaperWallet(qrCodeText, storage);
    expect(paperWallet.getAddress()).toEqual(mockWalletAddress);

    const sessionWallet = PaperWallet.loadFromStorage(storage);
    await expect(sessionWallet?.getPrivateKey()).resolves.toEqual(
      mockWalletPrivateKey
    );
  });

  test("Throws an error for invalid QR code content", () => {
    const qrCodeText = JSON.stringify({
      address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      invalidProperty: "invalid",
    });
    expect(
      () => new PaperWallet(qrCodeText)
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid Wallet QR Code format]`
    );
  });
});
