import { beforeEach, describe, expect, it, vi } from "vitest";

const destroy = vi.fn();
const findUserByAddress = vi.fn();
const createUser = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

vi.mock("iron-session", () => ({
  getIronSession: vi.fn().mockResolvedValue({
    address: "0x1234567890123456789012345678901234567890",
    chainId: 42220,
    destroy,
  }),
}));

vi.mock("~/server/api/models/user", () => ({
  UserModel: class {
    findUserByAddress = findUserByAddress;
    createUser = createUser;
  },
}));

vi.mock("~/server/db", () => ({
  graphDB: {},
  federatedDB: {},
}));

vi.mock("~/utils/cache/cache", () => ({
  cacheWithExpiry: vi.fn(
    (_key: string, _ttl: number, fetchValue: () => unknown) => fetchValue(),
  ),
}));

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("~/config/viem.config.server", () => ({ publicClient: {} }));
vi.mock("~/contracts/eth-faucet", () => ({ EthFaucet: class {} }));
vi.mock("~/contracts/writer", () => ({ withWriterLock: vi.fn() }));
vi.mock("~/utils/cache/kv", () => ({ redis: { del: vi.fn() } }));
vi.mock("~/env", () => ({
  env: {
    NODE_ENV: "test",
    NEXT_IRON_PASSWORD:
      "a-test-password-that-is-at-least-32-characters-long!!",
  },
}));

describe("session enrichment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findUserByAddress.mockResolvedValue(undefined);
  });

  it("does not recreate a user missing from the Sarafu database", async () => {
    const { auth } = await import("~/server/auth");

    await expect(auth()).resolves.toBeNull();
    expect(createUser).not.toHaveBeenCalled();
    expect(destroy).toHaveBeenCalledOnce();
  });
});
