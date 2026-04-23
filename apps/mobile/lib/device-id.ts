import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_ID_KEY = "sarafu_device_id";

function generateUUID(): string {
  // Simple UUID v4 without crypto dependency
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let cachedDeviceId: string | null = null;

/**
 * Get or create a persistent device ID.
 * Stored in AsyncStorage (not sensitive — just an identifier for nonce keying).
 */
export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;

  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = generateUUID();
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  cachedDeviceId = deviceId;
  return deviceId;
}
