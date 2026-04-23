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

vi.mock("@sarafu/api/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    address: "0x1234567890123456789012345678901234567890",
    chainId: 42220,
    user: {
      id: 1,
      default_voucher: null,
      family_name: "Test",
      gender: null,
      geo: null,
      given_names: "User",
      location_name: null,
      year_of_birth: null,
      role: "USER",
      account_id: 1,
    },
  }),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({}),
  headers: vi
    .fn()
    .mockResolvedValue(new Headers({ "x-forwarded-for": "1.2.3.4" })),
}));

vi.mock("@sarafu/api/auth/check-rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@sarafu/api/auth/get-ip", () => ({
  getClientIp: vi.fn().mockResolvedValue("1.2.3.4"),
}));

vi.mock("@sarafu/api/auth/rate-limit", () => ({
  sessionRateLimit: {},
}));

import { auth } from "@sarafu/api/auth";
import { checkRateLimit } from "@sarafu/api/auth/check-rate-limit";

describe("GET /api/auth/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns session data when authenticated", async () => {
    const { GET } = await import("~/app/api/auth/session/route");
    const response = await GET();
    const body = await response.json();

    expect(body.session).toEqual(
      expect.objectContaining({
        address: "0x1234567890123456789012345678901234567890",
        chainId: 42220,
      })
    );
    expect(body.session.user.role).toBe("USER");
    expect(response.status).toBe(200);
  });

  it("returns null session when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);

    const { GET } = await import("~/app/api/auth/session/route");
    const response = await GET();
    const body = await response.json();

    expect(body.session).toBeNull();
  });

  it("sets no-cache headers", async () => {
    const { GET } = await import("~/app/api/auth/session/route");
    const response = await GET();

    expect(response.headers.get("Cache-Control")).toBe(
      "private, no-cache, no-store, must-revalidate"
    );
  });

  it("returns 429 when rate limited", async () => {
    const rateLimitResponse = NextResponse.json(
      { ok: false, error: "Too many requests" },
      { status: 429 }
    );
    vi.mocked(checkRateLimit).mockResolvedValueOnce(rateLimitResponse);

    const { GET } = await import("~/app/api/auth/session/route");
    const response = await GET();

    expect(response.status).toBe(429);
  });
});
