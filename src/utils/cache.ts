import { kv } from "@vercel/kv";

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
  bypass?:boolean
): Promise<T> {
  // Try cache first
  const cached = await kv.get<T>(key);
  if (!bypass && cached !== null && cached !== undefined) {
    return cached;
  }

  // Compute, then store with TTL
  const value = await Promise.resolve(fetchFunction());
  // EX sets TTL in seconds; KV will evict automatically when expired
  await kv.set(key, value as T, { ex: expiryInSeconds });

  return value;
}
