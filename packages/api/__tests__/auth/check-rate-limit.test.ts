import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { checkRateLimit } from "../../src/auth/check-rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when under the rate limit", async () => {
    const mockLimiter = {
      limit: vi.fn().mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60_000,
      }),
    };

    const result = await checkRateLimit(mockLimiter as any, "127.0.0.1");
    expect(result).toBeNull();
    expect(mockLimiter.limit).toHaveBeenCalledWith("127.0.0.1");
  });

  it("returns 429 response when rate limited", async () => {
    const reset = Date.now() + 30_000;
    const mockLimiter = {
      limit: vi.fn().mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset,
      }),
    };

    const result = await checkRateLimit(mockLimiter as any, "127.0.0.1");
    expect(result).toBeInstanceOf(NextResponse);
    expect(result!.status).toBe(429);

    const body = await result!.json();
    expect(body).toEqual({ ok: false, error: "Too many requests" });

    expect(result!.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(result!.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(result!.headers.get("X-RateLimit-Reset")).toBe(reset.toString());
    expect(result!.headers.get("Retry-After")).toBeDefined();
  });

  it("fails open when Redis throws an error", async () => {
    const mockLimiter = {
      limit: vi.fn().mockRejectedValue(new Error("Redis connection failed")),
    };

    const result = await checkRateLimit(mockLimiter as any, "127.0.0.1");
    expect(result).toBeNull();
  });
});
