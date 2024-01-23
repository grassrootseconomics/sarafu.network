import { describe, expect, test } from "vitest";
import { PaperWallet } from "~/utils/paper-wallet";

describe("PaperWallet", () => {
  test("Can parse valid qrCodeText QR code content", () => {
    const qrCodeText = JSON.stringify({
      address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      privateKey: "0x5678DEADBEEF1234ABCD5678DEADBEEF1234ABCD",
    });
    const paperWallet = new PaperWallet(qrCodeText);
    expect(paperWallet.qrCodeContent).toEqual({
      address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      privateKey: "0x5678DEADBEEF1234ABCD5678DEADBEEF1234ABCD",
    });
  });
  test("Can parse valid encrypted QR code content", () => {
    const qrCodeText = JSON.stringify({
      address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      privateKey: "0x5678DEADBEEF1234ABCD5678DEADBEEF1234ABCD",
    });
    const paperWallet = new PaperWallet(qrCodeText);
    expect(paperWallet.qrCodeContent).toEqual({
      address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      privateKey: "0x5678DEADBEEF1234ABCD5678DEADBEEF1234ABCD",
    });
  });
  test("Throws an error for invalid QR code content", () => {
    const qrCodeText = JSON.stringify({
      address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      invalidProperty: "invalid",
    });
    expect(() => new PaperWallet(qrCodeText)).toThrowError(
      "Invalid Wallet QR Code format"
    );
  });

  test("Can get the address from the QR code content", () => {
    const qrCodeText = JSON.stringify({
      address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      privateKey: "0x5678DEADBEEF1234ABCD5678DEADBEEF1234ABCD",
    });
    const paperWallet = new PaperWallet(qrCodeText);
    expect(paperWallet.getAddress()).toEqual(
      "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD"
    );
  });
});
