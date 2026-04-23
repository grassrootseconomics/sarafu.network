// Crypto polyfill MUST run before expo-router/entry, which uses require.context
// to discover all route files. Without this, @noble/hashes captures
// globalThis.crypto as undefined before our polyfill in _layout.tsx can run.
import "./lib/crypto-polyfill";

import "expo-router/entry";
