import { beforeEach, describe, expect, it, vi } from "vitest";
import { getIsContractOwner } from "~/contracts/helpers";
import { VoucherModel } from "~/server/api/models/voucher";
import { voucherRouter } from "~/server/api/routers/voucher";
import { AccountRoleType } from "~/server/enums";
import { mockUserAddress } from "../../../__mocks__/user";
import {
  mockDeployInput,
  mockVoucherAddress,
} from "../../../__mocks__/voucher";

vi.mock("~/contracts", () => ({
  VoucherIndex: {
    exists: vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return false;
    }),
    add: vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return true;
    }),
    remove: vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return true;
    }),
  },
}));

vi.mock("~/server/api/models/voucher");
vi.mock("~/contracts/helpers");
vi.mocked(getIsContractOwner).mockResolvedValue(true);
vi.mock("~/server/discord");

vi.mock("~/lib/sarafu/custodial", () => ({
  deployERC20: vi.fn().mockResolvedValue({
    description: "Token deployment initiated",
    ok: true,
    result: { trackingId: "test-tracking-id" }
  }),
  deployDMR20: vi.fn().mockResolvedValue({
    description: "DMR20 deployment initiated",
    ok: true,
    result: { trackingId: "test-tracking-id" }
  }),
  waitForDeployment: vi.fn().mockResolvedValue({
    address: "0xEB3907eCaD74a0013C259D5874aE7f22DCBcC95a"
  }),
  OTXType: {
    STANDARD_TOKEN_DEPLOY: "STANDARD_TOKEN_DEPLOY",
    EXPIRING_TOKEN_DEPLOY: "EXPIRING_TOKEN_DEPLOY",
    DEMURRAGE_TOKEN_DEPLOY: "DEMURRAGE_TOKEN_DEPLOY",
  }
}));

vi.mock("~/env", () => ({
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
    NEXT_PUBLIC_TOKEN_INDEX_ADDRESS: "0x1234567890123456789012345678901234567890",
    NEXT_PUBLIC_ETH_FAUCET_ADDRESS: "0x1234567890123456789012345678901234567890",
    NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS: "0x1234567890123456789012345678901234567890",
    NEXT_PUBLIC_BALANCE_SCANNER_ADDRESS: "0x1234567890123456789012345678901234567890",
  }
}));

vi.mock("~/contracts/writer", () => ({
  getWriterWalletClient: vi.fn().mockReturnValue({
    deployContract: vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return mockVoucherAddress;
    }),
    writeContract: vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return mockVoucherAddress;
    }),
  }),
}));

vi.mock("~/config/viem.config.server", () => ({
  publicClient: {
    waitForTransactionReceipt: vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { status: "success", contractAddress: mockVoucherAddress };
    }),
    readContract: vi.fn().mockResolvedValue(6),
  },
  defaultReceiptOptions: {
    retryCount: 10,
    confirmations: 5,
    retryDelay: 1000,
    pollingInterval: 1000,
  },
}));

// Mock fetch for custodial API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Test context setup
const ctxBase = {
  graphDB: {} as any,
  federatedDB: {} as any,
  session: null,
  ip: "test",
};

const ctx = {
  superUser: {
    ...ctxBase,
    session: {
      user: {
        id: 1,
        role: AccountRoleType.SUPER_ADMIN,
        account_id: 1,
      },
      address: mockUserAddress,
    },
  },
  noAuth: {
    ...ctxBase,
  },
};

describe("voucherRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe("list", () => {
    it("should return a list of vouchers", async () => {
      const vouchers = [
        {
          id: 1,
          symbol: "TEST",
          voucher_type: "TEST",
          active: true,
          banner_url: null,
          contract_version: null,
          created_at: new Date(),
          geo: null,
          icon_url: null,
          location_name: null,
          sink_address: null,
          updated_at: null,
          voucher_address: "0x1234",
          voucher_description: "Test",
          voucher_email: null,
          voucher_name: "Test",
          voucher_uoa: null,
          voucher_value: null,
          voucher_website: null,
        },
      ];
      vi.mocked(VoucherModel.prototype.listVouchers).mockResolvedValue(
        vouchers
      );

      const result = await voucherRouter.createCaller(ctx.noAuth).list();

      expect(result).toEqual(vouchers);
      expect(VoucherModel.prototype.listVouchers).toHaveBeenCalledOnce();
    });
  });

  describe("remove", () => {
    it("should remove a voucher if user has permission", async () => {
      const input = { voucherAddress: mockVoucherAddress };
      vi.mocked(VoucherModel.prototype.deleteVoucher).mockResolvedValue({
        symbol: "TEST",
        id: 1,
        voucher_address: mockVoucherAddress,
        voucher_description: "Test",
        voucher_name: "Test",
      });

      const result = await voucherRouter
        .createCaller(ctx.superUser)
        .remove(input);

      expect(result).toBe(true);
      expect(VoucherModel.prototype.deleteVoucher).toHaveBeenCalledWith(
        input.voucherAddress
      );
    });

    it("should throw an error if user does not have permission", async () => {
      const input = { voucherAddress: mockVoucherAddress };

      await expect(
        voucherRouter.createCaller(ctx.noAuth).remove(input)
      ).rejects.toThrowError("UNAUTHORIZED");
      expect(VoucherModel.prototype.deleteVoucher).not.toHaveBeenCalled();
    });
  });

  describe("byAddress", () => {
    it("should return a voucher by address", async () => {
      const input = { voucherAddress: mockVoucherAddress };
      const voucher = {
        id: 1,
        symbol: "TEST",
        voucher_type: "TEST",
        banner_url: null,
        created_at: new Date(),
        geo: null,
        icon_url: null,
        location_name: null,
        sink_address: null,
        updated_at: null,
        voucher_address: mockVoucherAddress,
        voucher_description: "Test",
        voucher_email: null,
        voucher_name: "Test",
        voucher_uoa: null,
        voucher_value: null,
        voucher_website: null,
      };
      const issuers = [
        {
          backer: 1,
          family_name: "Doe",
          given_names: "John",
        },
      ];
      vi.mocked(VoucherModel.prototype.findVoucherByAddress).mockResolvedValue(
        voucher
      );
      vi.mocked(VoucherModel.prototype.getVoucherIssuers).mockResolvedValue(
        issuers
      );

      const result = await voucherRouter
        .createCaller(ctx.noAuth)
        .byAddress(input);

      expect(result).toEqual({ ...voucher });
      expect(VoucherModel.prototype.findVoucherByAddress).toHaveBeenCalledWith(
        input.voucherAddress
      );
    });

    it("should return null if voucher not found", async () => {
      const input = { voucherAddress: mockVoucherAddress };
      vi.mocked(VoucherModel.prototype.findVoucherByAddress).mockResolvedValue(
        null
      );

      const result = await voucherRouter
        .createCaller(ctx.noAuth)
        .byAddress(input);

      expect(result).toBe(null);
      expect(VoucherModel.prototype.findVoucherByAddress).toHaveBeenCalledWith(
        input.voucherAddress
      );
      expect(VoucherModel.prototype.getVoucherIssuers).not.toHaveBeenCalled();
    });
  });

  describe("commodities", () => {
    it("should return voucher commodities", async () => {
      const input = { voucher_id: 1 };
      const commodities = [
        {
          id: 1,
          quantity: 1,
          frequency: "daily",
          commodity_description: "Test",
          commodity_name: "Test",
          price: null,
          commodity_type: "GOOD",
          voucher_id: 1,
        },
      ];
      vi.mocked(VoucherModel.prototype.getVoucherCommodities).mockResolvedValue(
        commodities
      );

      const result = await voucherRouter
        .createCaller(ctx.noAuth)
        .commodities(input);

      expect(result).toEqual(commodities);
      expect(VoucherModel.prototype.getVoucherCommodities).toHaveBeenCalledWith(
        input.voucher_id
      );
    });
  });

  describe("holders", () => {
    it("should return voucher holders", async () => {
      const input = { voucherAddress: mockVoucherAddress };
      const holders = [{ address: mockUserAddress }];
      vi.mocked(VoucherModel.prototype.getVoucherHolders).mockResolvedValue(
        holders
      );

      const result = await voucherRouter
        .createCaller(ctx.noAuth)
        .holders(input);

      expect(result).toEqual(holders);
      expect(VoucherModel.prototype.getVoucherHolders).toHaveBeenCalledWith(
        input.voucherAddress
      );
    });
  });

  describe("deploy", () => {
    it("should deploy a voucher", async () => {
      vi.mocked(VoucherModel.prototype.createVoucher).mockResolvedValue({
        id: 1,
        symbol: "TEST",
        voucher_address: mockVoucherAddress,
        voucher_description: "Test",
        voucher_name: "Test",
      });

      // Custodial deployment functions are now mocked directly

      const generator = await voucherRouter
        .createCaller(ctx.superUser)
        .deploy(mockDeployInput);

      const { value } = await generator.next();

      expect(value).toEqual({
        message: "Deploying your Token",
        status: "loading",
      });

      const v2 = await generator.next();
      expect(v2.value).toEqual({
        message: "Adding to Database",
        status: "loading",
      });

      const v3 = await generator.next();
      expect(v3.value).toEqual({
        address: mockVoucherAddress,
        message: "Deployment Complete",
        status: "success",
      });
      // Deployment process complete
    });

    it("should throw an error if user is not logged in", async () => {
      await expect(
        voucherRouter.createCaller(ctx.noAuth).deploy(mockDeployInput)
      ).rejects.toThrowError("UNAUTHORIZED");
    });
  });

  describe("update", () => {
    it("should update a voucher if user has permission", async () => {
      const input = {
        voucherAddress: mockVoucherAddress,
        geo: null,
        voucherEmail: null,
        voucherWebsite: null,
        locationName: null,
        voucherDescription: "Test",
      };
      const date = new Date();
      vi.mocked(VoucherModel.prototype.updateVoucher).mockResolvedValue({
        symbol: "TEST",
        voucher_type: "TEST",
        active: true,
        banner_url: null,
        contract_version: null,
        created_at: date,
        geo: null,
        icon_url: null,
        id: 1,
        location_name: null,
        sink_address: null,
        updated_at: null,
        voucher_address: mockVoucherAddress,
        voucher_description: "Test",
        voucher_email: null,
        voucher_name: "Test",
        voucher_uoa: null,
        voucher_value: null,
        voucher_website: null,
      });

      const result = await voucherRouter
        .createCaller(ctx.superUser)
        .update(input);

      expect(result).toStrictEqual({
        active: true,
        banner_url: null,
        contract_version: null,
        created_at: date,
        geo: null,
        icon_url: null,
        id: 1,
        location_name: null,
        sink_address: null,
        symbol: "TEST",
        updated_at: null,
        voucher_address: "0xEB3907eCaD74a0013C259D5874aE7f22DCBcC95a",
        voucher_description: "Test",
        voucher_email: null,
        voucher_name: "Test",
        voucher_type: "TEST",
        voucher_uoa: null,
        voucher_value: null,
        voucher_website: null,
      });
      expect(VoucherModel.prototype.updateVoucher).toHaveBeenCalledWith(input);
    });

    it("should throw an error if user does not have permission", async () => {
      const input = {
        voucherAddress: mockVoucherAddress,
        geo: null,
        voucherEmail: null,
        voucherWebsite: null,
        locationName: null,
        voucherDescription: "Test",
      };

      await expect(
        voucherRouter.createCaller(ctx.noAuth).update(input)
      ).rejects.toThrowError("UNAUTHORIZED");
      expect(VoucherModel.prototype.updateVoucher).not.toHaveBeenCalled();
    });
  });
});
