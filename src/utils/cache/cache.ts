import type { SuperJSONResult } from "superjson";
import { env } from "~/env";
import superjson from "~/utils/trpc-transformer";
import { redis } from "./kv";

/**
 * Debug logging that only runs in development
 */
function debugLog(message: string, ...optionalParams: unknown[]) {
  if (env.NODE_ENV === "development") {
    console.log(`[Cache] ${message}`, ...optionalParams);
  }
}

/**
 * Type guard to validate SuperJSON structure
 */
function isSuperJSONResult(value: unknown): value is SuperJSONResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return "json" in obj && (!("meta" in obj) || typeof obj.meta === "object");
}

/**
 * Get a value from KV if present; otherwise compute it, store it with an expiry, and return it.
 * @param key Unique cache key
 * @param expiryInSeconds Time-to-live in seconds for the cached value
 * @param fetchFunction Function that returns the fresh value (can be sync or async)
 * @returns The cached or freshly-fetched value
 */
export async function cacheWithExpiry<T>(
  key: string,
  expiryInSeconds: number,
  fetchFunction: () => T | Promise<T>,
  bypass?: boolean
): Promise<T> {
  // Try cache first
  const cached = await redis.get(key);
  if (!bypass && cached !== null && cached !== undefined) {
    try {
      // Upstash auto-deserializes, so we might get a SuperJSON object or string
      if (typeof cached === "string") {
        debugLog(`Loaded: ${key}`);
        const parsed = superjson.parse<T>(cached);
        return parsed;
      }
      // If it's a SuperJSON object structure, deserialize it
      if (isSuperJSONResult(cached)) {
        debugLog(`Loaded: ${key}`);
        const deserialized = superjson.deserialize<T>(cached);
        return deserialized;
      }
      // Otherwise return as-is
      debugLog(`Fetched from cache: ${key}`);
      return cached as T;
    } catch (err) {
      // Log error but fall through to fetch fresh data
      debugLog(`Deserialization failed for key:: ${key}`, err);
      // Fall through to fetch fresh data
    }
  }

  // Compute, then store with TTL
  const value = await Promise.resolve(fetchFunction());

  try {
    // EX sets TTL in seconds; KV will evict automatically when expired
    const valuestr = superjson.stringify(value);
    await redis.set(key, valuestr, { ex: expiryInSeconds });
    debugLog(`Setting: ${key}`);
  } catch (err) {
    // Cache write failed - log but return the value anyway
    debugLog(`Failed to set cache: ${key}`, err);
    // Continue execution - cache write failure should not break the application
  }

  return value;
}
