import { beforeEach, describe, expect, it, vi } from "vitest";
import { poolRouter } from "~/server/api/routers/pool";
import { productsRouter } from "~/server/api/routers/products";
import { reportRouter } from "~/server/api/routers/report";
import { staffRouter } from "~/server/api/routers/staff";
import {
  creationDisabledProcedure,
  router,
  staffCreationDisabledProcedure,
} from "~/server/api/trpc";
import { AccountRoleType, CommodityType } from "~/server/enums";

const sideEffects = vi.hoisted(() => ({
  database: vi.fn(),
  deployPool: vi.fn(),
  registerENS: vi.fn(),
  sendNewPoolEmbed: vi.fn(),
  withWriterLock: vi.fn(),
}));

vi.mock("~/env", () => ({ env: { NODE_ENV: "test" } }));
vi.mock("~/config/viem.config.server", () => ({
  defaultReceiptOptions: {},
  publicClient: {},
}));
vi.mock("~/contracts", () => ({ PoolIndex: {} }));
vi.mock("~/contracts/helpers", () => ({ getIsContractOwner: vi.fn() }));
vi.mock("~/contracts/eth-faucet", () => ({ EthFaucet: class {} }));
vi.mock("~/contracts/writer", () => ({
  withWriterLock: sideEffects.withWriterLock,
}));
vi.mock("~/lib/sarafu/custodial", () => ({
  deployPool: sideEffects.deployPool,
  getContractAddressFromTxHash: vi.fn(),
  OTXType: { SWAPPOOL_DEPLOY: "SWAPPOOL_DEPLOY" },
  preCalculateContractAddress: vi.fn(),
  trackOTX: vi.fn(),
}));
vi.mock("~/lib/sarafu/resolver", () => ({
  registerENS: sideEffects.registerENS,
}));
vi.mock("~/server/discord", () => ({
  sendNewPoolEmbed: sideEffects.sendNewPoolEmbed,
}));
vi.mock("~/utils/cache/kv", () => ({
  redis: {
    del: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  },
}));

const resolver = vi.fn();

const testRouter = router({
  accountCreation: creationDisabledProcedure.mutation(resolver),
  staffWalletCreation: staffCreationDisabledProcedure.mutation(resolver),
});
const graphDB = new Proxy(
  {},
  {
    get() {
      sideEffects.database();
      throw new Error("Creation resolver reached the database");
    },
  },
);

const context = {
  graphDB,
  federatedDB: {},
  ip: "test",
  session: {
    address: "0x1234567890123456789012345678901234567890" as const,
    chainId: 42220,
    user: {
      id: 1,
      account_id: 1,
      role: AccountRoleType.SUPER_ADMIN,
    },
  },
};

describe("creation-disabled procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks authenticated creation before running its resolver", async () => {
    await expect(
      testRouter.createCaller(context as never).accountCreation(),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(resolver).not.toHaveBeenCalled();
  });

  it("also blocks staff and super-admin creation", async () => {
    await expect(
      testRouter.createCaller(context as never).staffWalletCreation(),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(resolver).not.toHaveBeenCalled();
  });

  it.each([
    [
      "pool.create",
      () =>
        poolRouter.createCaller(context as never).create({
          name: "Blocked Pool",
          symbol: "BLOCK",
          decimals: 6,
          description: "Must not be created",
          unit_of_account: "USD",
        }),
    ],
    [
      "report.create",
      () =>
        reportRouter.createCaller(context as never).create({
          title: "Blocked Report",
          description: "Must not be created",
          report: "Report body",
          vouchers: [],
          image_url: null,
          tags: [],
          location: null,
          period: null,
        }),
    ],
    [
      "products.insert",
      () =>
        productsRouter.createCaller(context as never).insert({
          commodity_name: "Blocked Offer",
          commodity_description: "Must not be created",
          commodity_type: CommodityType.SERVICE,
          quantity: null,
          price: null,
          frequency: null,
          voucher_address: "0x1234567890123456789012345678901234567890",
        }),
    ],
    [
      "staff.createWallet",
      () =>
        staffRouter.createCaller(context as never).createWallet({
          address: "0x2345678901234567890123456789012345678901",
          autoApproveGas: true,
        }),
    ],
  ])("blocks %s before external or database work", async (_name, invoke) => {
    await expect(invoke()).rejects.toMatchObject({ code: "FORBIDDEN" });

    expect(sideEffects.database).not.toHaveBeenCalled();
    expect(sideEffects.deployPool).not.toHaveBeenCalled();
    expect(sideEffects.registerENS).not.toHaveBeenCalled();
    expect(sideEffects.sendNewPoolEmbed).not.toHaveBeenCalled();
    expect(sideEffects.withWriterLock).not.toHaveBeenCalled();
  });
});
