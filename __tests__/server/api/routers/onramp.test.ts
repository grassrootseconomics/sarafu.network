import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("~/env", () => ({
  env: {
    PRETIUM_RAMP_API_URL: "https://pretium.example.com",
    KV_REST_API_URL: "https://kv.example.com",
    KV_REST_API_TOKEN: "test-token",
  },
}));

vi.mock("~/utils/cache/kv", () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    sadd: vi.fn().mockResolvedValue(1),
    smembers: vi.fn().mockResolvedValue([]),
    del: vi.fn().mockResolvedValue(0),
  },
}));

vi.mock("~/lib/sarafu/pretium", () => ({
  getRates: vi.fn(),
  triggerOnramp: vi.fn(),
  getTransactionsByAddress: vi.fn(),
  PretiumError: class PretiumError extends Error {
    constructor(public code: string, public description: string) {
      super(description);
      this.name = "PretiumError";
    }
  },
}));

const { getUserInfoMock } = vi.hoisted(() => ({
  getUserInfoMock: vi.fn(),
}));
vi.mock("~/server/api/models/user", () => ({
  UserModel: class {
    getUserInfo = getUserInfoMock;
  },
}));

const { assertRateOkMock } = vi.hoisted(() => ({
  assertRateOkMock: vi.fn(),
}));
vi.mock("~/server/auth/rate-limit", () => ({
  onrampTriggerRateLimit: {},
  assertRateOk: assertRateOkMock,
}));

import { onrampRouter } from "~/server/api/routers/onramp";
import * as pretium from "~/lib/sarafu/pretium";
import { AccountRoleType } from "~/server/enums";
import { mockUserAddress } from "../../../__mocks__/user";

const authedCtx = {
  graphDB: {} as any,
  federatedDB: {} as any,
  ip: "127.0.0.1",
  session: {
    address: mockUserAddress as `0x${string}`,
    chainId: 42220,
    user: {
      id: 1,
      role: AccountRoleType.USER,
      account_id: 1,
    },
  },
};

const noAuthCtx = {
  graphDB: {} as any,
  federatedDB: {} as any,
  ip: "127.0.0.1",
  session: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  assertRateOkMock.mockResolvedValue(undefined);
  // Default: a verified Kenyan phone that matches `+254700000000` (the value
  // used across the existing trigger tests).
  getUserInfoMock.mockResolvedValue({
    phone_number: "+254700000000",
    phone_verified_at: new Date(),
  });
});

describe("onrampRouter.getRates", () => {
  it("requires authentication", async () => {
    await expect(
      onrampRouter.createCaller(noAuthCtx as any).getRates()
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns the upstream rate payload", async () => {
    vi.mocked(pretium.getRates).mockResolvedValue({ buy: 130, sell: 132 });

    const result = await onrampRouter
      .createCaller(authedCtx as any)
      .getRates();

    expect(result).toEqual({ buy: 130, sell: 132 });
  });
});

describe("onrampRouter.trigger", () => {
  const validInput = {
    phoneNumber: "+254700000000",
    asset: "USDT" as const,
    amount: 100,
  };

  it("requires authentication", async () => {
    await expect(
      onrampRouter.createCaller(noAuthCtx as any).trigger(validInput)
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects amount below 100", async () => {
    await expect(
      onrampRouter
        .createCaller(authedCtx as any)
        .trigger({ ...validInput, amount: 99 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects amount above 250000", async () => {
    await expect(
      onrampRouter
        .createCaller(authedCtx as any)
        .trigger({ ...validInput, amount: 250_001 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects unknown asset", async () => {
    await expect(
      onrampRouter
        .createCaller(authedCtx as any)
        .trigger({ ...validInput, asset: "ETH" as any })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("forwards session address (checksummed) and locally-normalized phone to the pretium client", async () => {
    vi.mocked(pretium.triggerOnramp).mockResolvedValue({
      transactionCode: "TX-1",
      status: "PENDING",
      message: "ok",
    });

    await onrampRouter.createCaller(authedCtx as any).trigger(validInput);

    expect(pretium.triggerOnramp).toHaveBeenCalledWith({
      address: "0xEb3907ECAD74A0013C259d5874aE7F22DCBcC95B",
      phoneNumber: "0700000000",
      asset: "USDT",
      amount: 100,
    });
  });

  it.each([
    ["+254700000000", "0700000000"],
    ["254700000000", "0700000000"],
    ["0700000000", "0700000000"],
    ["+254 700 000 000", "0700000000"],
    ["+254-700-000-000", "0700000000"],
  ])("normalizes %s to %s before sending upstream", async (raw, expected) => {
    vi.mocked(pretium.triggerOnramp).mockResolvedValue({
      transactionCode: "TX-1",
      status: "PENDING",
      message: "ok",
    });

    await onrampRouter
      .createCaller(authedCtx as any)
      .trigger({ ...validInput, phoneNumber: raw });

    expect(pretium.triggerOnramp).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: expected })
    );
  });

  it("rejects an unparseable phone number with BAD_REQUEST", async () => {
    await expect(
      onrampRouter
        .createCaller(authedCtx as any)
        .trigger({ ...validInput, phoneNumber: "abc" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("maps PretiumError(bad_request) to TRPCError BAD_REQUEST", async () => {
    vi.mocked(pretium.triggerOnramp).mockRejectedValue(
      new pretium.PretiumError("bad_request", "amount invalid")
    );

    await expect(
      onrampRouter.createCaller(authedCtx as any).trigger(validInput)
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "amount invalid",
    });
  });

  it("maps PretiumError(not_found) to TRPCError NOT_FOUND", async () => {
    vi.mocked(pretium.triggerOnramp).mockRejectedValue(
      new pretium.PretiumError("not_found", "phone not linked")
    );

    await expect(
      onrampRouter.createCaller(authedCtx as any).trigger(validInput)
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("maps PretiumError(upstream) to TRPCError INTERNAL_SERVER_ERROR", async () => {
    vi.mocked(pretium.triggerOnramp).mockRejectedValue(
      new pretium.PretiumError("upstream", "boom")
    );

    await expect(
      onrampRouter.createCaller(authedCtx as any).trigger(validInput)
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });

  it("rejects with FORBIDDEN when the user has no verified phone", async () => {
    getUserInfoMock.mockResolvedValueOnce({
      phone_number: "+254700000000",
      phone_verified_at: null,
    });

    await expect(
      onrampRouter.createCaller(authedCtx as any).trigger(validInput)
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: /verify your phone/i,
    });
    expect(pretium.triggerOnramp).not.toHaveBeenCalled();
  });

  it("rejects with FORBIDDEN when the input phone doesn't match the verified one", async () => {
    getUserInfoMock.mockResolvedValueOnce({
      phone_number: "+254711111111",
      phone_verified_at: new Date(),
    });

    await expect(
      onrampRouter.createCaller(authedCtx as any).trigger(validInput)
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: /does not match/i,
    });
    expect(pretium.triggerOnramp).not.toHaveBeenCalled();
  });

  it("rate-limits the trigger mutation keyed on the wallet address", async () => {
    vi.mocked(pretium.triggerOnramp).mockResolvedValue({
      transactionCode: "TX-RL",
      status: "PENDING",
      message: "ok",
    });
    await onrampRouter.createCaller(authedCtx as any).trigger(validInput);
    expect(assertRateOkMock).toHaveBeenCalledWith(
      expect.any(Object),
      `wallet-${mockUserAddress}`
    );
  });

  it("propagates TOO_MANY_REQUESTS without calling the pretium client", async () => {
    assertRateOkMock.mockRejectedValueOnce(
      new TRPCError({ code: "TOO_MANY_REQUESTS", message: "wait 60s" })
    );
    await expect(
      onrampRouter.createCaller(authedCtx as any).trigger(validInput)
    ).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    expect(pretium.triggerOnramp).not.toHaveBeenCalled();
  });

  it("accepts when the input phone matches the verified one (different formats)", async () => {
    vi.mocked(pretium.triggerOnramp).mockResolvedValue({
      transactionCode: "TX-2",
      status: "PENDING",
      message: "ok",
    });

    // Verified phone in E.164, input in local MSISDN — should match.
    getUserInfoMock.mockResolvedValueOnce({
      phone_number: "+254700000000",
      phone_verified_at: new Date(),
    });
    await onrampRouter
      .createCaller(authedCtx as any)
      .trigger({ ...validInput, phoneNumber: "0700000000" });

    expect(pretium.triggerOnramp).toHaveBeenCalled();
  });
});

describe("onrampRouter.transactions", () => {
  it("requires authentication", async () => {
    await expect(
      onrampRouter.createCaller(noAuthCtx as any).transactions()
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("forwards the checksummed session address to the pretium client", async () => {
    vi.mocked(pretium.getTransactionsByAddress).mockResolvedValue({
      address: "0xEb3907ECAD74A0013C259d5874aE7F22DCBcC95B",
      onramps: [],
      offramps: [],
      totalCount: 0,
    });

    await onrampRouter.createCaller(authedCtx as any).transactions();

    expect(pretium.getTransactionsByAddress).toHaveBeenCalledWith(
      "0xEb3907ECAD74A0013C259d5874aE7F22DCBcC95B"
    );
  });

  it("returns the upstream payload", async () => {
    const payload = {
      address: "0xEb3907ECAD74A0013C259d5874aE7F22DCBcC95B",
      onramps: [
        {
          ID: 1,
          PretiumID: "TX-1",
          PretiumStatus: "PENDING",
          MpesaConfirmation: null,
          PhoneNumber: "0700000000",
          AmountUSD: "1.50",
          AmountKES: "200.00",
          TxHash: "",
          TokenAddress: "0xabc",
          WalletAddress: "0xEb3907ECAD74A0013C259d5874aE7F22DCBcC95B",
          CreatedAt: "2026-05-11T06:21:09Z",
          UpdatedAt: "2026-05-11T06:21:09Z",
        },
      ],
      offramps: [],
      totalCount: 1,
    };
    vi.mocked(pretium.getTransactionsByAddress).mockResolvedValue(payload);

    const result = await onrampRouter
      .createCaller(authedCtx as any)
      .transactions();

    expect(result).toEqual(payload);
  });

  it("maps PretiumError(upstream) to TRPCError INTERNAL_SERVER_ERROR", async () => {
    vi.mocked(pretium.getTransactionsByAddress).mockRejectedValue(
      new pretium.PretiumError("upstream", "boom")
    );

    await expect(
      onrampRouter.createCaller(authedCtx as any).transactions()
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});
