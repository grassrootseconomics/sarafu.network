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
  PretiumError: class PretiumError extends Error {
    constructor(public code: string, public description: string) {
      super(description);
      this.name = "PretiumError";
    }
  },
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

  it("rejects amount below 20", async () => {
    await expect(
      onrampRouter
        .createCaller(authedCtx as any)
        .trigger({ ...validInput, amount: 10 })
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

  it("forwards session address (checksummed) to the pretium client", async () => {
    vi.mocked(pretium.triggerOnramp).mockResolvedValue({
      transactionCode: "TX-1",
      status: "PENDING",
      message: "ok",
    });

    await onrampRouter.createCaller(authedCtx as any).trigger(validInput);

    expect(pretium.triggerOnramp).toHaveBeenCalledWith({
      address: "0xEb3907ECAD74A0013C259d5874aE7F22DCBcC95B",
      phoneNumber: "+254700000000",
      asset: "USDT",
      amount: 100,
    });
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
});
