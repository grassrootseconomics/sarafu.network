import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CLOUD_BACKUP_KEY = "sarafu_mnemonic_cloud_backup";
const BACKUP_ENABLED_KEY = "sarafu_backup_enabled";

// Encryption constants matching web's crypto.ts pattern
const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer as ArrayBuffer;
}

async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt mnemonic with a user-chosen password using AES-256-GCM.
 */
async function encrypt(
  plaintext: string,
  password: string
): Promise<{ encrypted: string; salt: string; iv: string }> {
  const encoder = new TextEncoder();
  const salt = Crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = Crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext)
  );

  return {
    encrypted: bufferToHex(encrypted),
    salt: bufferToHex(salt.buffer as ArrayBuffer),
    iv: bufferToHex(iv.buffer as ArrayBuffer),
  };
}

/**
 * Decrypt mnemonic from encrypted backup.
 */
async function decrypt(
  encryptedHex: string,
  saltHex: string,
  ivHex: string,
  password: string
): Promise<string> {
  const salt = new Uint8Array(hexToBuffer(saltHex));
  const iv = new Uint8Array(hexToBuffer(ivHex));
  const key = await deriveKey(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    hexToBuffer(encryptedHex)
  );

  return new TextDecoder().decode(decrypted);
}

export function isCloudBackupAvailable(): boolean {
  // expo-secure-store syncs via iCloud Keychain (iOS) and Android Auto Backup
  return Platform.OS === "ios" || Platform.OS === "android";
}

export function getCloudName(): string {
  return Platform.OS === "ios" ? "iCloud" : "Google Drive";
}

/**
 * Create an encrypted cloud backup of the mnemonic.
 */
export async function createCloudBackup(
  mnemonic: string,
  password: string
): Promise<void> {
  const { encrypted, salt, iv } = await encrypt(mnemonic, password);
  const payload = JSON.stringify({ encrypted, salt, iv });

  // Store in secure store — on iOS this syncs via iCloud Keychain,
  // on Android it's included in Auto Backup via EncryptedSharedPreferences
  await SecureStore.setItemAsync(CLOUD_BACKUP_KEY, payload);
  await AsyncStorage.setItem(BACKUP_ENABLED_KEY, "true");
}

/**
 * Restore mnemonic from cloud backup.
 */
export async function restoreFromCloudBackup(
  password: string
): Promise<string> {
  const payload = await SecureStore.getItemAsync(CLOUD_BACKUP_KEY);
  if (!payload) throw new Error("No cloud backup found");

  const { encrypted, salt, iv } = JSON.parse(payload) as {
    encrypted: string;
    salt: string;
    iv: string;
  };

  return decrypt(encrypted, salt, iv, password);
}

/**
 * Check if a cloud backup exists on this device.
 */
export async function hasCloudBackup(): Promise<boolean> {
  const payload = await SecureStore.getItemAsync(CLOUD_BACKUP_KEY);
  return payload !== null;
}

/**
 * Check if backup has been enabled by the user.
 */
export async function isBackupEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(BACKUP_ENABLED_KEY);
  return value === "true";
}

/**
 * Remove cloud backup data.
 */
export async function removeCloudBackup(): Promise<void> {
  await SecureStore.deleteItemAsync(CLOUD_BACKUP_KEY);
  await AsyncStorage.removeItem(BACKUP_ENABLED_KEY);
}
