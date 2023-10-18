export const importKey = async (password: string) => {
  const encoder = new TextEncoder();
  const passBuffer = encoder.encode(password);
  return await window.crypto.subtle.importKey(
    "raw",
    passBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
};

export const deriveKey = async (keyMaterial: CryptoKey, salt: Uint8Array) => {
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

export const encryptPrivateKey = async (
  privateKey: string,
  password: string
) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(privateKey);

  const keyMaterial = await importKey(password);
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const cryptoKey = await deriveKey(keyMaterial, salt);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    data
  );

  return { encryptedContent, salt, iv };
};

export const decryptPrivateKey = async (
  encryptedData: ArrayBuffer,
  salt: Uint8Array,
  iv: Uint8Array,
  password: string
) => {
  const keyMaterial = await importKey(password);
  const cryptoKey = await deriveKey(keyMaterial, salt);

  const decryptedContent = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedContent);
};
