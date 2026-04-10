import { beforeEach, describe, expect, it, vi } from "vitest";
import { meRouter } from "../../src/routers/me";
import { AccountRoleType } from "@sarafu/core/enums";
import { redis } from "../../src/cache/kv";

vi.mock("../../src/env", () => ({
  env: {
    SARAFU_CUSTODIAL_API_URL: "https://api.example.com",
    SARAFU_CUSTODIAL_API_TOKEN: "test-token",
    GRAPH_DB_URL: "postgresql://test",
    FEDERATED_DB_URL: "postgresql://test",
    NODE_ENV: "test",
    NEXT_IRON_PASSWORD: "test-password",
    WRITER_PRIVATE_KEY: "test-private-key",
    SARAFU_CHECKOUT_API_TOKEN: "test-token",
    SARAFU_CHECKOUT_API_URL: "https://api.example.com",
    SARAFU_RESOLVER_API_URL: "https://api.example.com",
    SARAFU_RESOLVER_API_TOKEN: "test-token",
    NEXT_PUBLIC_TOKEN_INDEX_ADDRESS:
      "0x1234567890123456789012345678901234567890",
    NEXT_PUBLIC_ETH_FAUCET_ADDRESS:
      "0x1234567890123456789012345678901234567890",
    NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS:
      "0x1234567890123456789012345678901234567890",
    NEXT_PUBLIC_BALANCE_SCANNER_ADDRESS:
      "0x1234567890123456789012345678901234567890",
  },
}));

vi.mock("../../src/cache/kv", () => ({
  redis: {
    del: vi.fn().mockResolvedValue(1),
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock("@sarafu/contracts", () => ({
  VoucherIndex: { exists: vi.fn().mockResolvedValue(false) },
}));

vi.mock("../../src/discord");

vi.mock("@sarafu/core/contacts", () => ({
  CELO_TOKEN_ADDRESS: "0x0000000000000000000000000000000000000001",
  CUSD_TOKEN_ADDRESS: "0x0000000000000000000000000000000000000002",
}));

const mockAddress = "0xEb3907ECAD74A0013C259d5874aE7F22DCBcC95B";

const validOnboardingInput = {
  given_names: "Alice",
  family_name: "Smith",
  email: "alice@example.com",
  date_of_birth: new Date("1990-06-15"),
  location_name: "Nairobi",
  geo: { x: 36.8, y: -1.3 },
};

/**
 * Creates a mock graphDB that supports Kysely-style method chaining.
 * `selectResult` is returned by executeTakeFirst/executeTakeFirstOrThrow.
 * `setCallTracker` captures args passed to `.set()` calls.
 */
function createMockGraphDB(
  selectResult: unknown,
  setCallTracker: Array<Record<string, unknown>> = []
) {
  function createChain(terminal: () => unknown) {
    const chain: Record<string, any> = {};
    const methods = [
      "selectFrom",
      "innerJoin",
      "where",
      "select",
      "updateTable",
    ];
    for (const method of methods) {
      chain[method] = vi.fn().mockReturnValue(chain);
    }
    chain.set = vi.fn().mockImplementation((values: Record<string, unknown>) => {
      setCallTracker.push(values);
      return chain;
    });
    chain.executeTakeFirst = vi.fn().mockResolvedValue(terminal());
    chain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(terminal());
    chain.execute = vi.fn().mockResolvedValue([]);
    return chain;
  }

  // The router calls graphDB in 3 separate chains:
  // 1. selectFrom("users") → findAccountByAddress
  // 2. updateTable("personal_information") → set profile
  // 3. updateTable("accounts") → set onboarding_completed
  const selectChain = createChain(() => selectResult);
  const updateChain1 = createChain(() => undefined);
  const updateChain2 = createChain(() => undefined);

  let updateCallCount = 0;
  const db: Record<string, any> = {
    selectFrom: vi.fn().mockReturnValue(selectChain),
    updateTable: vi.fn().mockImplementation(() => {
      updateCallCount++;
      return updateCallCount === 1 ? updateChain1 : updateChain2;
    }),
  };

  return { db, selectChain, updateChain1, updateChain2 };
}

describe("meRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("completeOnboarding", () => {
    it("returns success on happy path", async () => {
      const setCalls: Array<Record<string, unknown>> = [];
      const { db } = createMockGraphDB(
        { userId: 1, accountId: 1 },
        setCalls
      );

      const ctx = {
        graphDB: db as any,
        federatedDB: {} as any,
        session: {
          address: mockAddress,
          user: { id: 1, role: AccountRoleType.USER, account_id: 1 },
        },
        ip: "127.0.0.1",
      };

      const result = await meRouter
        .createCaller(ctx)
        .completeOnboarding(validOnboardingInput);

      expect(result).toEqual({ success: true });
    });

    it("updates personal_information with correct fields", async () => {
      const setCalls: Array<Record<string, unknown>> = [];
      const { db } = createMockGraphDB(
        { userId: 1, accountId: 1 },
        setCalls
      );

      const ctx = {
        graphDB: db as any,
        federatedDB: {} as any,
        session: {
          address: mockAddress,
          user: { id: 1, role: AccountRoleType.USER, account_id: 1 },
        },
        ip: "127.0.0.1",
      };

      await meRouter
        .createCaller(ctx)
        .completeOnboarding(validOnboardingInput);

      // First set call is personal_information update
      expect(setCalls[0]).toMatchObject({
        given_names: "Alice",
        family_name: "Smith",
        email: "alice@example.com",
        date_of_birth: "1990-06-15",
        year_of_birth: 1990,
        location_name: "Nairobi",
        geo: { x: 36.8, y: -1.3 },
        bio: null,
        profile_photo_url: null,
      });
    });

    it("sets onboarding_completed to true on accounts", async () => {
      const setCalls: Array<Record<string, unknown>> = [];
      const { db } = createMockGraphDB(
        { userId: 1, accountId: 1 },
        setCalls
      );

      const ctx = {
        graphDB: db as any,
        federatedDB: {} as any,
        session: {
          address: mockAddress,
          user: { id: 1, role: AccountRoleType.USER, account_id: 1 },
        },
        ip: "127.0.0.1",
      };

      await meRouter
        .createCaller(ctx)
        .completeOnboarding(validOnboardingInput);

      // Second set call is accounts update
      expect(setCalls[1]).toEqual({ onboarding_completed: true });
    });

    it("invalidates redis session cache", async () => {
      const { db } = createMockGraphDB({ userId: 1, accountId: 1 });

      const ctx = {
        graphDB: db as any,
        federatedDB: {} as any,
        session: {
          address: mockAddress,
          user: { id: 1, role: AccountRoleType.USER, account_id: 1 },
        },
        ip: "127.0.0.1",
      };

      await meRouter
        .createCaller(ctx)
        .completeOnboarding(validOnboardingInput);

      expect(redis.del).toHaveBeenCalledOnce();
      expect(redis.del).toHaveBeenCalledWith(
        `auth:session:${mockAddress}`
      );
    });

    it("formats date_of_birth with zero-padded month and day", async () => {
      const setCalls: Array<Record<string, unknown>> = [];
      const { db } = createMockGraphDB(
        { userId: 1, accountId: 1 },
        setCalls
      );

      const ctx = {
        graphDB: db as any,
        federatedDB: {} as any,
        session: {
          address: mockAddress,
          user: { id: 1, role: AccountRoleType.USER, account_id: 1 },
        },
        ip: "127.0.0.1",
      };

      await meRouter.createCaller(ctx).completeOnboarding({
        ...validOnboardingInput,
        date_of_birth: new Date("2000-01-05"),
      });

      expect(setCalls[0]?.date_of_birth).toBe("2000-01-05");
      expect(setCalls[0]?.year_of_birth).toBe(2000);
    });

    it("handles null optional fields", async () => {
      const setCalls: Array<Record<string, unknown>> = [];
      const { db } = createMockGraphDB(
        { userId: 1, accountId: 1 },
        setCalls
      );

      const ctx = {
        graphDB: db as any,
        federatedDB: {} as any,
        session: {
          address: mockAddress,
          user: { id: 1, role: AccountRoleType.USER, account_id: 1 },
        },
        ip: "127.0.0.1",
      };

      await meRouter.createCaller(ctx).completeOnboarding({
        ...validOnboardingInput,
        bio: undefined,
        profile_photo_url: undefined,
      });

      expect(setCalls[0]?.bio).toBeNull();
      expect(setCalls[0]?.profile_photo_url).toBeNull();
    });

    it("handles geo as null", async () => {
      const setCalls: Array<Record<string, unknown>> = [];
      const { db } = createMockGraphDB(
        { userId: 1, accountId: 1 },
        setCalls
      );

      const ctx = {
        graphDB: db as any,
        federatedDB: {} as any,
        session: {
          address: mockAddress,
          user: { id: 1, role: AccountRoleType.USER, account_id: 1 },
        },
        ip: "127.0.0.1",
      };

      await meRouter.createCaller(ctx).completeOnboarding({
        ...validOnboardingInput,
        geo: null,
      });

      expect(setCalls[0]?.geo).toBeNull();
    });

    it("rejects unauthenticated users", async () => {
      const ctx = {
        graphDB: {} as any,
        federatedDB: {} as any,
        session: null,
        ip: "127.0.0.1",
      };

      await expect(
        meRouter
          .createCaller(ctx)
          .completeOnboarding(validOnboardingInput)
      ).rejects.toThrowError("UNAUTHORIZED");
    });

    it("rejects when user not found in DB", async () => {
      const { db } = createMockGraphDB(undefined);

      const ctx = {
        graphDB: db as any,
        federatedDB: {} as any,
        session: {
          address: mockAddress,
          user: { id: 1, role: AccountRoleType.USER, account_id: 1 },
        },
        ip: "127.0.0.1",
      };

      await expect(
        meRouter
          .createCaller(ctx)
          .completeOnboarding(validOnboardingInput)
      ).rejects.toThrowError("No user found");
    });
  });
});
