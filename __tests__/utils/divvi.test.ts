import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  createDivviReferralTag,
  submitDivviReferral,
  appendDivviReferralTag,
  DIVVI_CONSUMER_ADDRESS,
  CELO_CHAIN_ID,
} from "~/utils/divvi";

// Mock the @divvi/referral-sdk module
vi.mock("@divvi/referral-sdk", () => ({
  getReferralTag: vi.fn(
    ({
      user,
      consumer,
      providers,
    }: {
      user: string;
      consumer: string;
      providers?: readonly string[];
    }) => {
      // Return a mock referral tag (just a hex-like string for testing)
      const providersHash = providers?.length
        ? providers.join("").slice(2, 10)
        : "00000000";
      return `${user.slice(2, 10)}${consumer.slice(2, 10)}${providersHash}`;
    }
  ),
  submitReferral: vi.fn(),
}));

describe("Divvi Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Constants", () => {
    it("should have the correct consumer address", () => {
      expect(DIVVI_CONSUMER_ADDRESS).toBe(
        "0x5523058cdFfe5F3c1EaDADD5015E55C6E00fb439"
      );
    });

    it("should have the correct Celo chain ID", () => {
      expect(CELO_CHAIN_ID).toBe(42220);
    });
  });

  describe("createDivviReferralTag", () => {
    it("should create a referral tag for a user", () => {
      const userAddress =
        "0x1234567890123456789012345678901234567890" as `0x${string}`;
      const tag = createDivviReferralTag(userAddress);

      expect(tag).toBeDefined();
      expect(typeof tag).toBe("string");
      expect(tag.length).toBeGreaterThan(0);
    });

    it("should create a referral tag with providers", () => {
      const userAddress =
        "0x1234567890123456789012345678901234567890" as `0x${string}`;
      const providers = [
        "0xABCDEF0000000000000000000000000000000001",
      ] as readonly `0x${string}`[];

      const tag = createDivviReferralTag(userAddress, providers);

      expect(tag).toBeDefined();
      expect(typeof tag).toBe("string");
    });

    it("should call getReferralTag with correct parameters", async () => {
      const { getReferralTag } = await import("@divvi/referral-sdk");
      const userAddress =
        "0x1234567890123456789012345678901234567890" as `0x${string}`;
      const providers = [
        "0xABCDEF0000000000000000000000000000000001",
      ] as readonly `0x${string}`[];

      createDivviReferralTag(userAddress, providers);

      expect(getReferralTag).toHaveBeenCalledWith({
        user: userAddress,
        consumer: DIVVI_CONSUMER_ADDRESS,
        providers,
      });
    });
  });

  describe("submitDivviReferral", () => {
    it("should submit a referral with default chain ID", async () => {
      const { submitReferral } = await import("@divvi/referral-sdk");
      (submitReferral as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
      } as Response);

      const txHash =
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;

      await submitDivviReferral(txHash);

      expect(submitReferral).toHaveBeenCalledWith({
        txHash,
        chainId: CELO_CHAIN_ID,
      });
    });

    it("should submit a referral with custom chain ID", async () => {
      const { submitReferral } = await import("@divvi/referral-sdk");
      (submitReferral as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
      } as Response);

      const txHash =
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;
      const customChainId = 1;

      await submitDivviReferral(txHash, customChainId);

      expect(submitReferral).toHaveBeenCalledWith({
        txHash,
        chainId: customChainId,
      });
    });

    it("should handle API errors gracefully", async () => {
      const { submitReferral } = await import("@divvi/referral-sdk");
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        /* ignore */
      });
      (submitReferral as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      } as Response);

      const txHash =
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;

      // Should not throw
      await expect(submitDivviReferral(txHash)).resolves.not.toThrow();

      // Should log the error
      expect(consoleSpy).toHaveBeenCalled();
    });

    it("should handle network errors gracefully", async () => {
      const { submitReferral } = await import("@divvi/referral-sdk");
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        /* ignore */
      });
      (submitReferral as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network error")
      );

      const txHash =
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as `0x${string}`;

      // Should not throw
      await expect(submitDivviReferral(txHash)).resolves.not.toThrow();

      // Should log the error
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("appendDivviReferralTag", () => {
    it("should append referral tag to transaction data", () => {
      const data =
        "0x12345678" as `0x${string}`;
      const userAddress =
        "0x1234567890123456789012345678901234567890" as `0x${string}`;

      const result = appendDivviReferralTag(data, userAddress);

      expect(result).toContain(data);
      expect(result.length).toBeGreaterThan(data.length);
      expect(result.startsWith("0x")).toBe(true);
    });

    it("should append referral tag with providers", () => {
      const data =
        "0x12345678" as `0x${string}`;
      const userAddress =
        "0x1234567890123456789012345678901234567890" as `0x${string}`;
      const providers = [
        "0xABCDEF0000000000000000000000000000000001",
      ] as readonly `0x${string}`[];

      const result = appendDivviReferralTag(data, userAddress, providers);

      expect(result).toContain(data);
      expect(result.length).toBeGreaterThan(data.length);
    });
  });
});
