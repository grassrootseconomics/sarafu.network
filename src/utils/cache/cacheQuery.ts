// lib/cache/cacheQuery.ts
import { redis } from "./kv";
import superjson from "~/utils/trpc-transformer";
import { cacheWithExpiry } from "./cache";

type CacheOpts<TCtx, TInput> = {
  key?: (a: { path: string; input: TInput; ctx: TCtx }) => string;
  bypass?: (a: {
    path: string;
    input: TInput;
    ctx: TCtx;
  }) => boolean | Promise<boolean>;
  tags?:
    | string[]
    | ((a: { path: string; input: TInput; ctx: TCtx }) => string[]);
};

/**
 * Wrap a tRPC v11 resolver to add KV caching.
 * Usage: .query(cacheQuery(ttl, resolver, opts))
 */
export function cacheQuery<TCtx = unknown, TInput = unknown, TOut = unknown>(
  ttlSeconds: number,
  resolver: (a: { ctx: TCtx; input: TInput }) => Promise<TOut> | TOut,
  opts?: CacheOpts<TCtx, TInput>
) {
  return async ({
    ctx,
    input,
  }: {
    ctx: TCtx & { __trpcPath?: string };
    input: TInput;
  }) => {
    const path = ctx.__trpcPath ?? "unknown";
    const key =
      opts?.key?.({ path, input, ctx }) ??
      `trpc:${path}:${superjson.stringify(input)}`;

    const bypass = opts?.bypass
      ? await opts.bypass({ path, input, ctx })
      : false;

    return cacheWithExpiry<TOut>(
      key,
      ttlSeconds,
      async () => {
        const fresh = await resolver({ ctx, input });
        const tags =
          typeof opts?.tags === "function"
            ? opts.tags({ path, input, ctx })
            : opts?.tags;
        if (tags?.length) void indexTags(tags, key);
        return fresh;
      },
      bypass
    );
  };
}

// --- optional tag indexing for invalidation ---
async function indexTags(tags: string[], key: string) {
  try {
    await Promise.all(tags.map((t) => redis.sadd(tagKey(t), key)));
  } catch (err) {
    // Log error but don't fail the cache operation
    console.error(`[Cache] Failed to index tags for key: ${key}`, err);
  }
}

const tagKey = (t: string) => `trpc:tag:${t}`;

/**
 * Chunk an array into smaller arrays of specified size
 */
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Invalidate all cache keys associated with a tag
 * Uses chunked deletion to avoid Redis command size limits
 */
export async function invalidateTag(tag: string) {
  try {
    const keys = (await redis.smembers(tagKey(tag))) ?? [];

    if (keys.length > 0) {
      // Delete keys in chunks of 100 to avoid command size limits
      const keyChunks = chunk(keys, 100);

      for (const keyChunk of keyChunks) {
        try {
          await redis.del(...keyChunk);
        } catch (err) {
          // Log but continue with remaining chunks
          console.error(
            `[Cache] Failed to delete chunk of ${keyChunk.length} keys for tag: ${tag}`,
            err
          );
        }
      }
    }

    // Delete the tag index itself
    await redis.del(tagKey(tag));
  } catch (err) {
    console.error(`[Cache] Failed to invalidate tag: ${tag}`, err);
    throw err; // Re-throw as tag invalidation failure should be visible
  }
}
