import { beforeEach, describe, expect, it, vi } from "vitest";
import { cacheQuery, invalidateTag } from "~/utils/cache/cacheQuery";
import superjson from "~/utils/trpc-transformer";

// Mock the redis client
vi.mock("~/utils/cache/kv", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    sadd: vi.fn(),
    smembers: vi.fn(),
    del: vi.fn(),
  },
}));

// Mock the env module
vi.mock("~/env", () => ({
  env: {
    NODE_ENV: "test",
  },
}));

// Import mocked redis after mocking
import { redis } from "~/utils/cache/kv";

describe("cacheQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Functionality", () => {
    it("should cache resolver results with default key generation", async () => {
      const ttl = 3600;
      const input = { userId: 1 };
      const output = { name: "Test User" };
      const ctx = { __trpcPath: "user.getById" };

      const resolver = vi.fn().mockResolvedValue(output);
      const cachedResolver = cacheQuery(ttl, resolver);

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const result = await cachedResolver({ ctx, input });

      expect(result).toEqual(output);
      expect(resolver).toHaveBeenCalledWith({ ctx, input });
      expect(redis.set).toHaveBeenCalledWith(
        expect.stringContaining("trpc:user.getById"),
        expect.any(String),
        { ex: ttl }
      );
    });

    it("should use cached value on subsequent calls", async () => {
      const ttl = 3600;
      const input = { userId: 1 };
      const output = { name: "Test User" };
      const ctx = { __trpcPath: "user.getById" };

      const resolver = vi.fn().mockResolvedValue(output);
      const cachedResolver = cacheQuery(ttl, resolver);

      vi.mocked(redis.get).mockResolvedValue(superjson.stringify(output));

      const result = await cachedResolver({ ctx, input });

      expect(result).toEqual(output);
      expect(resolver).not.toHaveBeenCalled();
    });

    it("should handle missing __trpcPath with fallback", async () => {
      const ttl = 3600;
      const input = { id: 1 };
      const output = { data: "test" };
      const ctx = {}; // No __trpcPath

      const resolver = vi.fn().mockResolvedValue(output);
      const cachedResolver = cacheQuery(ttl, resolver);

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const result = await cachedResolver({ ctx, input });

      expect(result).toEqual(output);
      expect(redis.set).toHaveBeenCalledWith(
        expect.stringContaining("trpc:unknown"),
        expect.any(String),
        { ex: ttl }
      );
    });
  });

  describe("Custom Key Generation", () => {
    it("should use custom key function when provided", async () => {
      const ttl = 3600;
      const input = { userId: 1 };
      const output = { name: "Test User" };
      const ctx = { __trpcPath: "user.getById" };
      const customKey = "custom:user:1";

      const resolver = vi.fn().mockResolvedValue(output);
      const cachedResolver = cacheQuery(ttl, resolver, {
        key: () => customKey,
      });

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      await cachedResolver({ ctx, input });

      expect(redis.set).toHaveBeenCalledWith(
        customKey,
        expect.any(String),
        { ex: ttl }
      );
    });

    it("should pass correct parameters to custom key function", async () => {
      const ttl = 3600;
      const input = { userId: 1 };
      const output = { name: "Test User" };
      const ctx = { __trpcPath: "user.getById", user: { id: 1 } };

      const keyFn = vi.fn().mockReturnValue("custom-key");
      const resolver = vi.fn().mockResolvedValue(output);
      const cachedResolver = cacheQuery(ttl, resolver, {
        key: keyFn,
      });

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      await cachedResolver({ ctx, input });

      expect(keyFn).toHaveBeenCalledWith({
        path: "user.getById",
        input,
        ctx,
      });
    });
  });

  describe("Cache Bypass", () => {
    it("should bypass cache when bypass option returns true", async () => {
      const ttl = 3600;
      const input = { userId: 1 };
      const output = { name: "Test User" };
      const ctx = { __trpcPath: "user.getById" };

      const resolver = vi.fn().mockResolvedValue(output);
      const cachedResolver = cacheQuery(ttl, resolver, {
        bypass: () => true,
      });

      vi.mocked(redis.get).mockResolvedValue(superjson.stringify(output));
      vi.mocked(redis.set).mockResolvedValue("OK");

      await cachedResolver({ ctx, input });

      // Should still call resolver even though cache has value
      expect(resolver).toHaveBeenCalled();
    });

    it("should use cache when bypass option returns false", async () => {
      const ttl = 3600;
      const input = { userId: 1 };
      const output = { name: "Test User" };
      const ctx = { __trpcPath: "user.getById" };

      const resolver = vi.fn().mockResolvedValue(output);
      const cachedResolver = cacheQuery(ttl, resolver, {
        bypass: () => false,
      });

      vi.mocked(redis.get).mockResolvedValue(superjson.stringify(output));

      await cachedResolver({ ctx, input });

      expect(resolver).not.toHaveBeenCalled();
    });

    it("should handle async bypass function", async () => {
      const ttl = 3600;
      const input = { userId: 1 };
      const output = { name: "Test User" };
      const ctx = { __trpcPath: "user.getById" };

      const resolver = vi.fn().mockResolvedValue(output);
      const cachedResolver = cacheQuery(ttl, resolver, {
        bypass: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return true;
        },
      });

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      await cachedResolver({ ctx, input });

      expect(resolver).toHaveBeenCalled();
    });

    it("should pass correct parameters to bypass function", async () => {
      const ttl = 3600;
      const input = { userId: 1 };
      const output = { name: "Test User" };
      const ctx = { __trpcPath: "user.getById", session: { userId: 1 } };

      const bypassFn = vi.fn().mockReturnValue(false);
      const resolver = vi.fn().mockResolvedValue(output);
      const cachedResolver = cacheQuery(ttl, resolver, {
        bypass: bypassFn,
      });

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      await cachedResolver({ ctx, input });

      expect(bypassFn).toHaveBeenCalledWith({
        path: "user.getById",
        input,
        ctx,
      });
    });
  });

  describe("Tag Indexing", () => {
    it("should index tags when tags array is provided", async () => {
      const ttl = 3600;
      const input = { userId: 1 };
      const output = { name: "Test User" };
      const ctx = { __trpcPath: "user.getById" };
      const tags = ["user", "profile"];

      const resolver = vi.fn().mockResolvedValue(output);
      const cachedResolver = cacheQuery(ttl, resolver, { tags });

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");
      vi.mocked(redis.sadd).mockResolvedValue(1);

      await cachedResolver({ ctx, input });

      expect(redis.sadd).toHaveBeenCalledTimes(2);
      expect(redis.sadd).toHaveBeenCalledWith(
        "trpc:tag:user",
        expect.any(String)
      );
      expect(redis.sadd).toHaveBeenCalledWith(
        "trpc:tag:profile",
        expect.any(String)
      );
    });

    it("should use dynamic tag function when provided", async () => {
      const ttl = 3600;
      const input = { userId: 1 };
      const output = { name: "Test User" };
      const ctx = { __trpcPath: "user.getById" };

      const tagFn = vi.fn().mockReturnValue(["user:1"]);
      const resolver = vi.fn().mockResolvedValue(output);
      const cachedResolver = cacheQuery(ttl, resolver, {
        tags: tagFn,
      });

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");
      vi.mocked(redis.sadd).mockResolvedValue(1);

      await cachedResolver({ ctx, input });

      expect(tagFn).toHaveBeenCalledWith({
        path: "user.getById",
        input,
        ctx,
      });
      expect(redis.sadd).toHaveBeenCalledWith(
        "trpc:tag:user:1",
        expect.any(String)
      );
    });

    it("should not index tags when array is empty", async () => {
      const ttl = 3600;
      const input = { userId: 1 };
      const output = { name: "Test User" };
      const ctx = { __trpcPath: "user.getById" };

      const resolver = vi.fn().mockResolvedValue(output);
      const cachedResolver = cacheQuery(ttl, resolver, { tags: [] });

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      await cachedResolver({ ctx, input });

      expect(redis.sadd).not.toHaveBeenCalled();
    });

    it("should handle tag indexing errors gracefully", async () => {
      const ttl = 3600;
      const input = { userId: 1 };
      const output = { name: "Test User" };
      const ctx = { __trpcPath: "user.getById" };
      const tags = ["user"];

      const resolver = vi.fn().mockResolvedValue(output);
      const cachedResolver = cacheQuery(ttl, resolver, { tags });

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");
      vi.mocked(redis.sadd).mockRejectedValue(new Error("Redis SADD failed"));

      // Should not throw even if tag indexing fails
      const result = await cachedResolver({ ctx, input });

      expect(result).toEqual(output);
    });
  });

  describe("Input Serialization", () => {
    it("should handle different input types in key generation", async () => {
      const ttl = 3600;
      const ctx = { __trpcPath: "test.query" };
      const output = { data: "test" };

      const resolver = vi.fn().mockResolvedValue(output);
      const cachedResolver = cacheQuery(ttl, resolver);

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      // Test with object input
      await cachedResolver({ ctx, input: { id: 1, nested: { value: "test" } } });
      expect(redis.set).toHaveBeenCalled();

      vi.clearAllMocks();
      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      // Test with array input
      await cachedResolver({ ctx, input: [1, 2, 3] });
      expect(redis.set).toHaveBeenCalled();

      vi.clearAllMocks();
      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      // Test with Date in input
      await cachedResolver({ ctx, input: { date: new Date("2025-01-01") } });
      expect(redis.set).toHaveBeenCalled();
    });
  });
});

describe("invalidateTag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Tag Invalidation", () => {
    it("should delete all cache keys associated with a tag", async () => {
      const tag = "user";
      const keys = ["key1", "key2", "key3"];

      vi.mocked(redis.smembers).mockResolvedValue(keys);
      vi.mocked(redis.del).mockResolvedValue(1);

      await invalidateTag(tag);

      expect(redis.smembers).toHaveBeenCalledWith("trpc:tag:user");
      expect(redis.del).toHaveBeenCalledWith(...keys);
      expect(redis.del).toHaveBeenCalledWith("trpc:tag:user");
    });

    it("should not attempt deletion when tag has no keys", async () => {
      const tag = "empty-tag";

      vi.mocked(redis.smembers).mockResolvedValue([]);
      vi.mocked(redis.del).mockResolvedValue(1);

      await invalidateTag(tag);

      expect(redis.smembers).toHaveBeenCalledWith("trpc:tag:empty-tag");
      // Should only delete the tag index, not call del with empty keys
      expect(redis.del).toHaveBeenCalledTimes(1);
      expect(redis.del).toHaveBeenCalledWith("trpc:tag:empty-tag");
    });

    it("should handle null response from smembers", async () => {
      const tag = "null-tag";

      vi.mocked(redis.smembers).mockResolvedValue(null as any);
      vi.mocked(redis.del).mockResolvedValue(1);

      await invalidateTag(tag);

      expect(redis.del).toHaveBeenCalledTimes(1);
      expect(redis.del).toHaveBeenCalledWith("trpc:tag:null-tag");
    });
  });

  describe("Chunked Deletion", () => {
    it("should delete keys in chunks of 100", async () => {
      const tag = "large-tag";
      const keys = Array.from({ length: 250 }, (_, i) => `key${i}`);

      vi.mocked(redis.smembers).mockResolvedValue(keys);
      vi.mocked(redis.del).mockResolvedValue(1);

      await invalidateTag(tag);

      // Should be called 3 times for chunks + 1 for tag itself
      expect(redis.del).toHaveBeenCalledTimes(4);

      // First chunk: 100 keys
      expect(redis.del).toHaveBeenNthCalledWith(1, ...keys.slice(0, 100));

      // Second chunk: 100 keys
      expect(redis.del).toHaveBeenNthCalledWith(2, ...keys.slice(100, 200));

      // Third chunk: 50 keys
      expect(redis.del).toHaveBeenNthCalledWith(3, ...keys.slice(200, 250));

      // Tag index
      expect(redis.del).toHaveBeenNthCalledWith(4, "trpc:tag:large-tag");
    });

    it("should handle exactly 100 keys without extra chunks", async () => {
      const tag = "exact-tag";
      const keys = Array.from({ length: 100 }, (_, i) => `key${i}`);

      vi.mocked(redis.smembers).mockResolvedValue(keys);
      vi.mocked(redis.del).mockResolvedValue(1);

      await invalidateTag(tag);

      // Should be called once for keys + once for tag
      expect(redis.del).toHaveBeenCalledTimes(2);
    });

    it("should continue deleting remaining chunks if one chunk fails", async () => {
      const tag = "partial-fail-tag";
      const keys = Array.from({ length: 250 }, (_, i) => `key${i}`);

      vi.mocked(redis.smembers).mockResolvedValue(keys);

      // First chunk succeeds, second fails, third succeeds
      vi.mocked(redis.del)
        .mockResolvedValueOnce(1) // First chunk
        .mockRejectedValueOnce(new Error("Chunk 2 failed")) // Second chunk
        .mockResolvedValueOnce(1) // Third chunk
        .mockResolvedValueOnce(1); // Tag index

      await invalidateTag(tag);

      // All chunks should be attempted
      expect(redis.del).toHaveBeenCalledTimes(4);
    });
  });

  describe("Error Handling", () => {
    it("should throw error if smembers fails", async () => {
      const tag = "error-tag";

      vi.mocked(redis.smembers).mockRejectedValue(
        new Error("Redis smembers failed")
      );

      await expect(invalidateTag(tag)).rejects.toThrow(
        "Redis smembers failed"
      );
    });

    it("should throw error if tag deletion fails", async () => {
      const tag = "error-tag";
      const keys = ["key1", "key2"];

      vi.mocked(redis.smembers).mockResolvedValue(keys);
      vi.mocked(redis.del)
        .mockResolvedValueOnce(1) // Keys deletion succeeds
        .mockRejectedValueOnce(new Error("Tag deletion failed")); // Tag deletion fails

      await expect(invalidateTag(tag)).rejects.toThrow();
    });

    it("should re-throw errors for visibility", async () => {
      const tag = "error-tag";
      const error = new Error("Critical failure");

      vi.mocked(redis.smembers).mockRejectedValue(error);

      await expect(invalidateTag(tag)).rejects.toThrow("Critical failure");
    });
  });

  describe("Edge Cases", () => {
    it("should handle single key deletion", async () => {
      const tag = "single-tag";
      const keys = ["single-key"];

      vi.mocked(redis.smembers).mockResolvedValue(keys);
      vi.mocked(redis.del).mockResolvedValue(1);

      await invalidateTag(tag);

      expect(redis.del).toHaveBeenCalledWith("single-key");
      expect(redis.del).toHaveBeenCalledWith("trpc:tag:single-tag");
    });

    it("should handle 101 keys (just over chunk size)", async () => {
      const tag = "overflow-tag";
      const keys = Array.from({ length: 101 }, (_, i) => `key${i}`);

      vi.mocked(redis.smembers).mockResolvedValue(keys);
      vi.mocked(redis.del).mockResolvedValue(1);

      await invalidateTag(tag);

      // 2 chunks + 1 tag deletion
      expect(redis.del).toHaveBeenCalledTimes(3);
      expect(redis.del).toHaveBeenNthCalledWith(1, ...keys.slice(0, 100));
      expect(redis.del).toHaveBeenNthCalledWith(2, ...keys.slice(100, 101));
    });

    it("should handle very large tag sets (1000+ keys)", async () => {
      const tag = "huge-tag";
      const keys = Array.from({ length: 1500 }, (_, i) => `key${i}`);

      vi.mocked(redis.smembers).mockResolvedValue(keys);
      vi.mocked(redis.del).mockResolvedValue(1);

      await invalidateTag(tag);

      // 15 chunks + 1 tag deletion
      expect(redis.del).toHaveBeenCalledTimes(16);
    });
  });
});
