// Must be imported before any code that uses @scure/bip39 (via viem/accounts).
// expo-crypto provides getRandomValues but does NOT auto-polyfill the global.
import { getRandomValues } from "expo-crypto";

if (typeof globalThis.crypto === "undefined") {
  // @ts-expect-error — minimal polyfill, only getRandomValues is needed
  globalThis.crypto = {};
}

if (typeof globalThis.crypto.getRandomValues !== "function") {
  globalThis.crypto.getRandomValues = getRandomValues;
}
