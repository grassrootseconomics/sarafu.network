import Constants from "expo-constants";

/**
 * Returns the base URL of the Sarafu Network API.
 *
 * In development, uses the Expo config extra field or falls back to localhost.
 * In production, points to the deployed web app.
 */
export function getApiBaseUrl(): string {
  const extra = Constants.expoConfig?.extra;
  if (extra?.apiBaseUrl) {
    return extra.apiBaseUrl as string;
  }
  // Default to localhost for development
  return "http://localhost:3000";
}
