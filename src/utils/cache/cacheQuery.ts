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
  await Promise.all(tags.map((t) => redis.sadd(tagKey(t), key)));
}
const tagKey = (t: string) => `trpc:tag:${t}`;

export async function invalidateTag(tag: string) {
  const keys = (await redis.smembers(tagKey(tag))) ?? [];
  if (keys.length) await redis.del(...keys);
  await redis.del(tagKey(tag));
}
