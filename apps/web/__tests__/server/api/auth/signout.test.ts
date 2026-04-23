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

vi.mock("@sarafu/api/auth/check-rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@sarafu/api/auth/get-ip", () => ({
  getClientIp: vi.fn().mockResolvedValue("1.2.3.4"),
}));

vi.mock("@sarafu/api/auth/rate-limit", () => ({
  signoutRateLimit: {},
}));

import { checkRateLimit } from "@sarafu/api/auth/check-rate-limit";

describe("POST /api/auth/signout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("destroys session and returns ok", async () => {
    const { POST } = await import("~/app/api/auth/signout/route");
    const response = await POST();
    const body = await response.json();

    expect(mockSession.destroy).toHaveBeenCalled();
    expect(body.ok).toBe(true);
    expect(response.status).toBe(200);
  });

  it("returns 429 when rate limited", async () => {
    const rateLimitResponse = NextResponse.json(
      { ok: false, error: "Too many requests" },
      { status: 429 }
    );
    vi.mocked(checkRateLimit).mockResolvedValueOnce(rateLimitResponse);

    const { POST } = await import("~/app/api/auth/signout/route");
    const response = await POST();

    expect(response.status).toBe(429);
  });
});
