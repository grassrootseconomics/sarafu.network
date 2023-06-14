import {
  decryptPrivateKey,
  encryptPrivateKey,
} from "../../../src/utils/crypto";

describe("Crypto Functions", () => {
  it("should encrypt and then decrypt a private key correctly", async () => {
    const privateKey =
      "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const password = "password123";

    const encrypted = await encryptPrivateKey(privateKey, password);

    const decrypted = await decryptPrivateKey(
      encrypted.encryptedContent,
      encrypted.salt,
      encrypted.iv,
      password
    );

    expect(decrypted).toEqual(privateKey);
  });

  it("should not decrypt with wrong password", async () => {
    const privateKey =
      "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const password = "password123";
    const wrongPassword = "wrongpassword";

    const encrypted = await encryptPrivateKey(privateKey, password);

    await expect(
      decryptPrivateKey(
        encrypted.encryptedContent,
        encrypted.salt,
        encrypted.iv,
        wrongPassword
      )
    ).rejects.toThrow();
  });
});
