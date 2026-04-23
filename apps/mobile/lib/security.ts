import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SECURITY_TYPE_KEY = "sarafu_security_type";
const PIN_HASH_KEY = "sarafu_pin_hash";

export type SecurityType = "biometric" | "pin" | "none";

export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

export async function authenticateWithBiometric(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Authenticate to access your wallet",
    fallbackLabel: "Use PIN",
    disableDeviceFallback: true,
  });
  return result.success;
}

export async function getSecurityType(): Promise<SecurityType> {
  const type = await AsyncStorage.getItem(SECURITY_TYPE_KEY);
  return (type as SecurityType) ?? "none";
}

export async function setSecurityType(type: SecurityType): Promise<void> {
  await AsyncStorage.setItem(SECURITY_TYPE_KEY, type);
}

/**
 * Simple PIN storage using a hash. For a production app consider
 * a stronger KDF, but for gating UI access this is sufficient since
 * the actual secrets are already in the OS secure store.
 */
export async function setPIN(pin: string): Promise<void> {
  // Simple hash for PIN comparison — not protecting secrets directly
  const hash = Array.from(pin).reduce(
    (h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0,
    0
  );
  await SecureStore.setItemAsync(PIN_HASH_KEY, hash.toString());
  await setSecurityType("pin");
}

export async function verifyPIN(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_HASH_KEY);
  if (!stored) return false;
  const hash = Array.from(pin).reduce(
    (h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0,
    0
  );
  return hash.toString() === stored;
}

export async function clearSecurity(): Promise<void> {
  await AsyncStorage.removeItem(SECURITY_TYPE_KEY);
  await SecureStore.deleteItemAsync(PIN_HASH_KEY);
}
