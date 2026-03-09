import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

vi.mock("~/env", () => ({
  env: {
    NODE_ENV: "test",
    NEXT_IRON_PASSWORD:
      "a-test-password-that-is-at-least-32-characters-long!!",
  },
}));

vi.mock("~/utils/cache/kv", () => ({
  redis: { get: vi.fn(), set: vi.fn(), del: vi.fn() },
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

const mockSession = {
  nonce: "valid-nonce" as string | undefined,
  nonceCreatedAt: Date.now() as number | undefined,
  address: undefined as string | undefined,
  chainId: undefined as number | undefined,
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
  parseSiweMessage: vi.fn().mockReturnValue({
    address: "0x1234567890123456789012345678901234567890",
    nonce: "valid-nonce",
    chainId: 42220,
  }),
  verifySiweMessage: vi.fn().mockResolvedValue(true),
}));

vi.mock("~/config/viem.config.server", () => ({
  publicClient: {},
}));

vi.mock("~/server/auth/check-rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("~/server/auth/get-ip", () => ({
  getClientIp: vi.fn().mockResolvedValue("1.2.3.4"),
}));

vi.mock("~/server/auth/rate-limit", () => ({
  verifyRateLimit: {},
}));

import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { checkRateLimit } from "~/server/auth/check-rate-limit";

function makeRequest(
  body: Record<string, unknown> = {},
  { includeHost = true }: { includeHost?: boolean } = {}
) {
  const jsonBody = {
    message: "valid-siwe-message",
    signature: "0xvalidsignature",
    ...body,
  };
  const headersMap: Record<string, string> = {
    "content-type": "application/json",
  };
  if (includeHost) {
    headersMap["host"] = "localhost";
  }
  return {
    json: () => Promise.resolve(jsonBody),
    headers: {
      get: (name: string) => headersMap[name.toLowerCase()] ?? null,
    },
  } as unknown as Request;
}

describe("POST /api/auth/verify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.nonce = "valid-nonce";
    mockSession.nonceCreatedAt = Date.now();
    mockSession.address = undefined;
    mockSession.chainId = undefined;
  });

  it("returns ok on valid SIWE verification", async () => {
    const { POST } = await import("~/app/api/auth/verify/route");
    const response = await POST(makeRequest());
    const body = await response.json();

    expect(body.ok).toBe(true);
    expect(response.status).toBe(200);
  });

  it("sets session address and chainId on success", async () => {
    const { POST } = await import("~/app/api/auth/verify/route");
    await POST(makeRequest());

    expect(mockSession.address).toBe(
      "0x1234567890123456789012345678901234567890"
    );
    expect(mockSession.chainId).toBe(42220);
    expect(mockSession.save).toHaveBeenCalled();
  });

  it("clears nonce and nonceCreatedAt on success", async () => {
    const { POST } = await import("~/app/api/auth/verify/route");
    await POST(makeRequest());

    expect(mockSession.nonce).toBeUndefined();
    expect(mockSession.nonceCreatedAt).toBeUndefined();
  });

  it("returns 400 for invalid SIWE message", async () => {
    vi.mocked(parseSiweMessage).mockReturnValueOnce({} as any);

    const { POST } = await import("~/app/api/auth/verify/route");
    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid SIWE message");
  });

  it("returns 400 for nonce mismatch", async () => {
    mockSession.nonce = "different-nonce";

    const { POST } = await import("~/app/api/auth/verify/route");
    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid nonce");
  });

  it("returns 400 for expired nonce", async () => {
    mockSession.nonceCreatedAt = Date.now() - 6 * 60 * 1000; // 6 minutes ago

    const { POST } = await import("~/app/api/auth/verify/route");
    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Nonce expired");
  });

  it("returns 400 for missing nonceCreatedAt", async () => {
    mockSession.nonceCreatedAt = undefined;

    const { POST } = await import("~/app/api/auth/verify/route");
    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Nonce expired");
  });

  it("returns 401 for invalid signature", async () => {
    vi.mocked(verifySiweMessage).mockResolvedValueOnce(false);

    const { POST } = await import("~/app/api/auth/verify/route");
    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Invalid signature");
  });

  it("returns 400 for missing host header", async () => {
    const { POST } = await import("~/app/api/auth/verify/route");
    const response = await POST(makeRequest({}, { includeHost: false }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Missing host header");
  });

  it("returns 429 when rate limited", async () => {
    const rateLimitResponse = NextResponse.json(
      { ok: false, error: "Too many requests" },
      { status: 429 }
    );
    vi.mocked(checkRateLimit).mockResolvedValueOnce(rateLimitResponse);

    const { POST } = await import("~/app/api/auth/verify/route");
    const response = await POST(makeRequest());

    expect(response.status).toBe(429);
  });

  it("returns 500 on unexpected errors", async () => {
    vi.mocked(parseSiweMessage).mockImplementationOnce(() => {
      throw new Error("unexpected");
    });

    const { POST } = await import("~/app/api/auth/verify/route");
    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Verification failed");
  });
});
