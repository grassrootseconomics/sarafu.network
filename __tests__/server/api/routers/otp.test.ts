import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("~/env", () => ({
  env: {
    KV_REST_API_URL: "https://kv.example.com",
    KV_REST_API_TOKEN: "test-token",
    NEXT_IRON_PASSWORD: "test-pepper",
  },
}));

const { redisDelMock } = vi.hoisted(() => ({
  redisDelMock: vi.fn().mockResolvedValue(0),
}));
vi.mock("~/utils/cache/kv", () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    del: redisDelMock,
  },
}));

const { issuePhoneMock, verifyPhoneMock } = vi.hoisted(() => ({
  issuePhoneMock: vi.fn(),
  verifyPhoneMock: vi.fn(),
}));
vi.mock("~/server/api/services/otp-service", () => ({
  otpService: {
    issuePhone: issuePhoneMock,
    verifyPhone: verifyPhoneMock,
  },
}));

const { setPhoneVerifiedMock } = vi.hoisted(() => ({
  setPhoneVerifiedMock: vi.fn(),
}));
vi.mock("~/server/api/models/user", () => ({
  UserModel: class {
    setPhoneVerified = setPhoneVerifiedMock;
  },
}));

const { assertRateOkMock } = vi.hoisted(() => ({
  assertRateOkMock: vi.fn(),
}));
vi.mock("~/server/auth/rate-limit", () => ({
  otpRequestRateLimit: {},
  otpVerifyRateLimit: {},
  assertRateOk: assertRateOkMock,
}));

import { TRPCError } from "@trpc/server";
import { otpRouter } from "~/server/api/routers/otp";
import { AccountRoleType } from "~/server/enums";
import { mockUserAddress } from "../../../__mocks__/user";

const authedCtx = {
  graphDB: {} as unknown,
  federatedDB: {} as unknown,
  ip: "127.0.0.1",
  session: {
    address: mockUserAddress as `0x${string}`,
    chainId: 42220,
    user: { id: 42, role: AccountRoleType.USER, account_id: 1 },
  },
};

const noAuthCtx = { ...authedCtx, session: null };

beforeEach(() => {
  vi.clearAllMocks();
  assertRateOkMock.mockResolvedValue(undefined);
});

describe("otpRouter.requestPhone", () => {
  it("requires authentication", async () => {
    await expect(
      otpRouter
        .createCaller(noAuthCtx as never)
        .requestPhone({ phone: "+254700000000" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects an invalid phone number with BAD_REQUEST", async () => {
    await expect(
      otpRouter
        .createCaller(authedCtx as never)
        .requestPhone({ phone: "abc" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("dispatches via OtpService when input is valid", async () => {
    issuePhoneMock.mockResolvedValue(undefined);
    const result = await otpRouter
      .createCaller(authedCtx as never)
      .requestPhone({ phone: "+254700000000" });

    expect(result).toEqual({ sent: true });
    expect(issuePhoneMock).toHaveBeenCalledWith("+254700000000");
    // Rate-limit was consulted with phone- and ip- keys
    expect(assertRateOkMock).toHaveBeenCalledWith(
      expect.any(Object),
      "phone-+254700000000",
      "ip-127.0.0.1"
    );
  });

  it("surfaces rate-limit refusals as TRPCError", async () => {
    assertRateOkMock.mockRejectedValueOnce(
      new TRPCError({ code: "TOO_MANY_REQUESTS", message: "wait 30s" })
    );

    await expect(
      otpRouter
        .createCaller(authedCtx as never)
        .requestPhone({ phone: "+254700000000" })
    ).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    expect(issuePhoneMock).not.toHaveBeenCalled();
  });
});

describe("otpRouter.verifyPhone", () => {
  it("requires authentication", async () => {
    await expect(
      otpRouter
        .createCaller(noAuthCtx as never)
        .verifyPhone({ phone: "+254700000000", code: "123456" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects non-6-digit code with BAD_REQUEST", async () => {
    await expect(
      otpRouter
        .createCaller(authedCtx as never)
        .verifyPhone({ phone: "+254700000000", code: "12345" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("writes setPhoneVerified on success", async () => {
    verifyPhoneMock.mockResolvedValue({ ok: true });
    const result = await otpRouter
      .createCaller(authedCtx as never)
      .verifyPhone({ phone: "+254700000000", code: "123456" });

    expect(result).toEqual({ verified: true, phone: "+254700000000" });
    expect(setPhoneVerifiedMock).toHaveBeenCalledWith(42, "+254700000000");
  });

  it("invalidates the cached session after successful verification", async () => {
    verifyPhoneMock.mockResolvedValue({ ok: true });
    await otpRouter
      .createCaller(authedCtx as never)
      .verifyPhone({ phone: "+254700000000", code: "123456" });

    expect(redisDelMock).toHaveBeenCalledWith(
      `auth:session:${mockUserAddress}`
    );
  });

  it("does not invalidate the cached session on failure", async () => {
    verifyPhoneMock.mockResolvedValue({ ok: false, reason: "wrong_code" });
    await expect(
      otpRouter
        .createCaller(authedCtx as never)
        .verifyPhone({ phone: "+254700000000", code: "000000" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(redisDelMock).not.toHaveBeenCalled();
  });

  it("maps service result {ok:false, reason:'wrong_code'} to BAD_REQUEST and does not write the user", async () => {
    verifyPhoneMock.mockResolvedValue({ ok: false, reason: "wrong_code" });
    await expect(
      otpRouter
        .createCaller(authedCtx as never)
        .verifyPhone({ phone: "+254700000000", code: "000000" })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: /wrong code/i,
    });
    expect(setPhoneVerifiedMock).not.toHaveBeenCalled();
  });

  it("maps {ok:false, reason:'expired'} to BAD_REQUEST", async () => {
    verifyPhoneMock.mockResolvedValue({ ok: false, reason: "expired" });
    await expect(
      otpRouter
        .createCaller(authedCtx as never)
        .verifyPhone({ phone: "+254700000000", code: "111111" })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: /expired/i,
    });
  });

  it("maps {ok:false, reason:'exhausted'} to BAD_REQUEST", async () => {
    verifyPhoneMock.mockResolvedValue({ ok: false, reason: "exhausted" });
    await expect(
      otpRouter
        .createCaller(authedCtx as never)
        .verifyPhone({ phone: "+254700000000", code: "222222" })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: /too many/i,
    });
  });
});
