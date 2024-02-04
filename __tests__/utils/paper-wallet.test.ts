// import crypto from "node:crypto";
import { describe, expect, test, vi } from "vitest";
import { PaperWallet } from "~/utils/paper-wallet";

// mock import { createPasswordEntryModal } from "~/lib/paper-connector/pin-modal/view";
vi.mock("~/lib/paper-connector/pin-modal/view", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("~/lib/paper-connector/pin-modal/view")
  >();
  return {
    ...actual,
    createPasswordEntryModal: () => Promise.resolve("test"),
  };
});

const mockEncryptedWallet = {
  address: "0x63A434cCB9552cAc52844D2C319d3e39b543dc68",
  encryptedContent:
    "110fa3ad55e363abe6a1c50e7a775279e4bf9062f6fa911342cccd4f4bc130aa628d2d372f548993bc6342dde28fd3e62b48a82531f15a4a76ee0e87e5199b73ff28f0a62b3405f0a4938abc3c85329db22e",
  salt: "d8b878c46d7ae7a64aee45dfe53878bf",
  iv: "73e3c49e68291f5ce6bc9f42",
};
const mockWalletPrivateKey =
  "0x05d45933729c9d413bbd0bc1a34ec252e2e1a5c5359d090524f930fc1cdd24ae";
const mockEncryptedWalletNew =
  mockEncryptedWallet.encryptedContent +
  mockEncryptedWallet.iv +
  mockEncryptedWallet.salt;
describe("PaperWallet", () => {
  test("Can generate valid qrCodeText QR code content", async () => {
    const paperWallet = await PaperWallet.generate("test");
    expect(paperWallet.encryptedContent.length).toMatchInlineSnapshot(`164`);
    expect(paperWallet.address.length).toMatchInlineSnapshot(`42`);
    const wallet = await PaperWallet.initialize(JSON.stringify(paperWallet));
    expect(wallet.qrCodeContent).toEqual(paperWallet);
  });
  test("Can parse valid qrCodeText QR code content", async () => {
    const qrCodeText = JSON.stringify({
      address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      privateKey: "0x5678DEADBEEF1234ABCD5678DEADBEEF1234ABCD",
    });
    const paperWallet = await PaperWallet.initialize(qrCodeText);
    expect(paperWallet.qrCodeContent).toMatchInlineSnapshot(`
      {
        "address": "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
        "privateKey": "0x5678DEADBEEF1234ABCD5678DEADBEEF1234ABCD",
      }
    `);
  });
  test("Can parse valid encrypted QR code content", async () => {
    const paperWallet = await PaperWallet.initialize(
      `${mockEncryptedWallet.encryptedContent}${mockEncryptedWallet.iv}${mockEncryptedWallet.salt}`
    );
    expect(paperWallet.qrCodeContent).toEqual(mockEncryptedWallet);
  });
  test("Throws an error for invalid QR code content", async () => {
    const qrCodeText = JSON.stringify({
      address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      invalidProperty: "invalid",
    });
    await expect(
      async () => await PaperWallet.initialize(qrCodeText)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid Wallet QR Code format]`
    );
  });

  test("Can just parse privatekey", async () => {
    const qrCodeText = JSON.stringify({
      address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      privateKey: "0x5678DEADBEEF1234ABCD5678DEADBEEF1234ABCD",
    });
    const paperWallet = await PaperWallet.initialize(qrCodeText);
    expect(paperWallet.getAddress()).toEqual(
      "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD"
    );
  });

  test("Can decrypt new encrypted wallet format", async () => {
    const paperWallet = await PaperWallet.initialize(mockEncryptedWalletNew);
    const account = await paperWallet.getAccount();
    const privateKey = await paperWallet.getPrivateKey("test");
    expect(privateKey).toEqual(mockWalletPrivateKey);
    expect(account).toMatchInlineSnapshot(`
      {
        "address": "0x63A434cCB9552cAc52844D2C319d3e39b543dc68",
        "publicKey": "0x04f13c42a7f0096983d9e65dcf25ebd230235503018f93da3eb42204c294da49cdff0cc77e2fa13ca6f488894d9267dd681f17f081f213d95c21967b03f5c408c9",
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "source": "privateKey",
        "type": "local",
      }
    `);
    expect(paperWallet.getAddress()).toEqual(mockEncryptedWallet.address);
  });
  test("Can decrypt new plain wallet format", async () => {
    const paperWallet = await PaperWallet.initialize(mockWalletPrivateKey);
    const account = await paperWallet.getAccount();
    const privateKey = await paperWallet.getPrivateKey("test");
    expect(privateKey).toEqual(mockWalletPrivateKey);
    expect(account).toMatchInlineSnapshot(`
      {
        "address": "0x63A434cCB9552cAc52844D2C319d3e39b543dc68",
        "publicKey": "0x04f13c42a7f0096983d9e65dcf25ebd230235503018f93da3eb42204c294da49cdff0cc77e2fa13ca6f488894d9267dd681f17f081f213d95c21967b03f5c408c9",
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "source": "privateKey",
        "type": "local",
      }
    `);
    expect(paperWallet.getAddress()).toEqual(mockEncryptedWallet.address);
  });
});
