import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Returns the base URL of the Sarafu Network API.
 *
 * In development, uses the Expo config extra field or falls back to localhost.
 * On Android emulator, 10.0.2.2 is used to reach the host machine's localhost.
 * In production, points to the deployed web app.
 */
export function getApiBaseUrl(): string {
  const extra = Constants.expoConfig?.extra;
  if (extra?.apiBaseUrl) {
    return extra.apiBaseUrl as string;
  }
  // Android emulator uses 10.0.2.2 to reach host machine's localhost
  const host = Platform.OS === "android" ? "10.0.2.2" : "localhost";
  return `http://${host}:3000`;
}
