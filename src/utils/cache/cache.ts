import { SuperJSONResult } from "superjson";
import superjson from "~/utils/trpc-transformer";
import { redis } from "./kv";

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
        console.log(`Fetched from Cache: ${key}`);
        return superjson.parse<T>(cached);
      }
      // If it's a SuperJSON object structure, deserialize it
      if (typeof cached === "object" && "json" in cached) {
        console.log(`Fetched from Cache: ${key}`);

        return superjson.deserialize<T>(cached as unknown as SuperJSONResult);
      }
      // Otherwise return as-is
      console.log(`Fetched from Cache: ${key}`);
      return cached as T;
    } catch (err) {
      console.error(err);
      console.error(`Loading cache ${key} failed`);
    }
  }

  // Compute, then store with TTL
  const value = await Promise.resolve(fetchFunction());
  // EX sets TTL in seconds; KV will evict automatically when expired
  const valuestr = superjson.stringify(value);
  console.log(`Set Cache: ${key}`);
  await redis.set(key, valuestr, { ex: expiryInSeconds });

  return value;
}
