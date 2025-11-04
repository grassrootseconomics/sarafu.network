import { beforeEach, describe, expect, it, vi } from "vitest";
import superjson from "~/utils/trpc-transformer";
import { cacheWithExpiry } from "~/utils/cache/cache";

// Mock the redis client
vi.mock("~/utils/cache/kv", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
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

describe("cacheWithExpiry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Cache Hit Scenarios", () => {
    it("should return cached value when cache hit with string", async () => {
      const key = "test-key";
      const cachedValue = { data: "test" };
      const serialized = superjson.stringify(cachedValue);

      vi.mocked(redis.get).mockResolvedValue(serialized);

      const fetchFn = vi.fn();
      const result = await cacheWithExpiry(key, 3600, fetchFn);

      expect(result).toEqual(cachedValue);
      expect(fetchFn).not.toHaveBeenCalled();
      expect(redis.get).toHaveBeenCalledWith(key);
    });

    it("should return cached value when cache hit with SuperJSON object", async () => {
      const key = "test-key";
      const cachedValue = { data: "test", date: new Date("2025-01-01") };
      const superJSONResult = superjson.serialize(cachedValue);

      vi.mocked(redis.get).mockResolvedValue(superJSONResult);

      const fetchFn = vi.fn();
      const result = await cacheWithExpiry(key, 3600, fetchFn);

      expect(result).toEqual(cachedValue);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it("should return cached value as-is when it's a plain object", async () => {
      const key = "test-key";
      const cachedValue = { simple: "object" };

      vi.mocked(redis.get).mockResolvedValue(cachedValue);

      const fetchFn = vi.fn();
      const result = await cacheWithExpiry(key, 3600, fetchFn);

      expect(result).toEqual(cachedValue);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it("should bypass cache when bypass flag is true", async () => {
      const key = "test-key";
      const cachedValue = "cached";
      const freshValue = "fresh";

      vi.mocked(redis.get).mockResolvedValue(cachedValue);

      const fetchFn = vi.fn().mockResolvedValue(freshValue);
      const result = await cacheWithExpiry(key, 3600, fetchFn, true);

      expect(result).toEqual(freshValue);
      expect(fetchFn).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
    });
  });

  describe("Cache Miss Scenarios", () => {
    it("should fetch and cache value on cache miss (null)", async () => {
      const key = "test-key";
      const freshValue = { data: "fresh" };

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const fetchFn = vi.fn().mockResolvedValue(freshValue);
      const result = await cacheWithExpiry(key, 3600, fetchFn);

      expect(result).toEqual(freshValue);
      expect(fetchFn).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalledWith(
        key,
        superjson.stringify(freshValue),
        { ex: 3600 }
      );
    });

    it("should fetch and cache value on cache miss (undefined)", async () => {
      const key = "test-key";
      const freshValue = { data: "fresh" };

      vi.mocked(redis.get).mockResolvedValue(undefined);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const fetchFn = vi.fn().mockResolvedValue(freshValue);
      const result = await cacheWithExpiry(key, 3600, fetchFn);

      expect(result).toEqual(freshValue);
      expect(fetchFn).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
    });

    it("should handle synchronous fetch functions", async () => {
      const key = "test-key";
      const freshValue = "sync-value";

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const fetchFn = vi.fn().mockReturnValue(freshValue);
      const result = await cacheWithExpiry(key, 3600, fetchFn);

      expect(result).toEqual(freshValue);
      expect(fetchFn).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should fall back to fresh data when deserialization fails", async () => {
      const key = "test-key";
      const freshValue = { data: "fresh" };
      const malformedCache = "invalid-json-{{{";

      vi.mocked(redis.get).mockResolvedValue(malformedCache);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const fetchFn = vi.fn().mockResolvedValue(freshValue);
      const result = await cacheWithExpiry(key, 3600, fetchFn);

      expect(result).toEqual(freshValue);
      expect(fetchFn).toHaveBeenCalled();
    });

    it("should return fresh value even if cache write fails", async () => {
      const key = "test-key";
      const freshValue = { data: "fresh" };

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockRejectedValue(new Error("Redis write failed"));

      const fetchFn = vi.fn().mockResolvedValue(freshValue);
      const result = await cacheWithExpiry(key, 3600, fetchFn);

      expect(result).toEqual(freshValue);
      expect(fetchFn).toHaveBeenCalled();
    });

    it("should handle fetch function errors", async () => {
      const key = "test-key";
      const error = new Error("Fetch failed");

      vi.mocked(redis.get).mockResolvedValue(null);

      const fetchFn = vi.fn().mockRejectedValue(error);

      await expect(cacheWithExpiry(key, 3600, fetchFn)).rejects.toThrow(
        "Fetch failed"
      );
    });

    it("should handle malformed SuperJSON structure gracefully", async () => {
      const key = "test-key";
      const freshValue = { data: "fresh" };
      const malformedSuperJSON = { json: "data", meta: "invalid" }; // meta should be object

      vi.mocked(redis.get).mockResolvedValue(malformedSuperJSON);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const fetchFn = vi.fn().mockResolvedValue(freshValue);
      const result = await cacheWithExpiry(key, 3600, fetchFn);

      // Type guard should reject this (meta is not an object), so it returns as-is
      expect(result).toEqual(malformedSuperJSON);
      expect(fetchFn).not.toHaveBeenCalled();
    });
  });

  describe("TTL Configuration", () => {
    it("should set correct TTL when caching", async () => {
      const key = "test-key";
      const freshValue = { data: "fresh" };
      const ttl = 7200; // 2 hours

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const fetchFn = vi.fn().mockResolvedValue(freshValue);
      await cacheWithExpiry(key, ttl, fetchFn);

      expect(redis.set).toHaveBeenCalledWith(
        key,
        superjson.stringify(freshValue),
        { ex: ttl }
      );
    });
  });

  describe("Type Safety", () => {
    it("should preserve type information through caching", async () => {
      interface User {
        id: number;
        name: string;
        createdAt: Date;
      }

      const key = "user-key";
      const user: User = {
        id: 1,
        name: "Test User",
        createdAt: new Date("2025-01-01"),
      };

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const fetchFn = vi.fn().mockResolvedValue(user);
      const result = await cacheWithExpiry<User>(key, 3600, fetchFn);

      expect(result.id).toBe(1);
      expect(result.name).toBe("Test User");
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should handle arrays correctly", async () => {
      const key = "array-key";
      const arrayValue = [1, 2, 3, 4, 5];

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const fetchFn = vi.fn().mockResolvedValue(arrayValue);
      const result = await cacheWithExpiry(key, 3600, fetchFn);

      expect(result).toEqual(arrayValue);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle complex nested objects", async () => {
      const key = "complex-key";
      const complexValue = {
        user: { id: 1, name: "Test" },
        metadata: {
          dates: [new Date("2025-01-01"), new Date("2025-01-02")],
          settings: { enabled: true, count: 5 },
        },
      };

      vi.mocked(redis.get).mockResolvedValue(
        superjson.stringify(complexValue)
      );

      const fetchFn = vi.fn();
      const result = await cacheWithExpiry(key, 3600, fetchFn);

      expect(result).toEqual(complexValue);
      expect(result.metadata.dates[0]).toBeInstanceOf(Date);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string as cache value", async () => {
      const key = "test-key";
      const emptyString = "";

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const fetchFn = vi.fn().mockResolvedValue(emptyString);
      const result = await cacheWithExpiry(key, 3600, fetchFn);

      expect(result).toBe("");
    });

    it("should handle zero as cache value", async () => {
      const key = "test-key";
      const zero = 0;

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const fetchFn = vi.fn().mockResolvedValue(zero);
      const result = await cacheWithExpiry(key, 3600, fetchFn);

      expect(result).toBe(0);
    });

    it("should handle false as cache value", async () => {
      const key = "test-key";
      const falseBool = false;

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const fetchFn = vi.fn().mockResolvedValue(falseBool);
      const result = await cacheWithExpiry(key, 3600, fetchFn);

      expect(result).toBe(false);
    });
  });
});
