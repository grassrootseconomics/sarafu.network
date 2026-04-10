import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

vi.mock("~/env", () => ({
  env: {
    NODE_ENV: "test",
    NEXT_IRON_PASSWORD:
      "a-test-password-that-is-at-least-32-characters-long!!",
  },
}));

vi.mock("@sarafu/api/cache/kv", () => ({
  redis: { get: vi.fn(), set: vi.fn(), del: vi.fn() },
}));

const mockSession = {
  nonce: undefined as string | undefined,
  nonceCreatedAt: undefined as number | undefined,
  save: vi.fn(),
  destroy: vi.fn(),
};

vi.mock("iron-session", () => ({
  getIronSession: vi.fn().mockResolvedValue(mockSession),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({}),
  headers: vi
    .fn()
    .mockResolvedValue(new Headers({ "x-forwarded-for": "1.2.3.4" })),
}));

vi.mock("viem/siwe", () => ({
  generateSiweNonce: vi.fn().mockReturnValue("test-nonce-abc123"),
}));

vi.mock("@sarafu/api/auth/check-rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@sarafu/api/auth/get-ip", () => ({
  getClientIp: vi.fn().mockResolvedValue("1.2.3.4"),
}));

vi.mock("@sarafu/api/auth/rate-limit", () => ({
  nonceRateLimit: {},
}));

import { checkRateLimit } from "@sarafu/api/auth/check-rate-limit";

describe("GET /api/auth/nonce", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.nonce = undefined;
    mockSession.nonceCreatedAt = undefined;
  });

  it("returns a nonce in the response", async () => {
    const { GET } = await import("~/app/api/auth/nonce/route");
    const response = await GET();
    const body = await response.json();

    expect(body.nonce).toBe("test-nonce-abc123");
  });

  it("stores nonce and timestamp in session", async () => {
    const { GET } = await import("~/app/api/auth/nonce/route");
    await GET();

    expect(mockSession.nonce).toBe("test-nonce-abc123");
    expect(mockSession.nonceCreatedAt).toBeTypeOf("number");
    expect(mockSession.save).toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    const rateLimitResponse = NextResponse.json(
      { ok: false, error: "Too many requests" },
      { status: 429 }
    );
    vi.mocked(checkRateLimit).mockResolvedValueOnce(rateLimitResponse);

    const { GET } = await import("~/app/api/auth/nonce/route");
    const response = await GET();

    expect(response.status).toBe(429);
  });
});
