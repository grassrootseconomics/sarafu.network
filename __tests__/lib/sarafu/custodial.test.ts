import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { deployERC20, deployDMR20, deployPool, trackOTX, getContractAddressFromTxHash, waitForDeployment, OTXType } from "~/lib/sarafu/custodial";

// Mock the environment variables
vi.mock("~/env", () => ({
  env: {
    SARAFU_CUSTODIAL_API_URL: "https://api.example.com",
    SARAFU_CUSTODIAL_API_TOKEN: "test-token"
  }
}));

// Mock the viem config
vi.mock("~/config/viem.config.server", () => ({
  publicClient: {
    getTransactionReceipt: vi.fn()
  }
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Custodial API Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("deployERC20", () => {
    it("should successfully deploy ERC20 token", async () => {
      const mockResponse = {
        description: "ERC20 token deployed successfully",
        ok: true,
        result: { contractAddress: "0x1234567890abcdef" }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const requestData = {
        decimals: 18,
        initialMintee: "0xabcdef1234567890",
        initialSupply: "1000000",
        name: "Test Token",
        owner: "0x1234567890abcdef",
        symbol: "TEST"
      };

      const result = await deployERC20(requestData);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/contracts/erc20",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer test-token"
          },
          body: JSON.stringify(requestData)
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should throw error when deployment fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      const requestData = {
        decimals: 18,
        initialMintee: "0xabcdef1234567890",
        initialSupply: "1000000",
        name: "Test Token",
        owner: "0x1234567890abcdef",
        symbol: "TEST"
      };

      await expect(deployERC20(requestData)).rejects.toThrow("API request failed: 400");
    });
  });

  describe("deployPool", () => {
    it("should successfully deploy pool", async () => {
      const mockResponse = {
        description: "Pool deployed successfully",
        ok: true,
        result: { contractAddress: "0xabcdef1234567890" }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const requestData = {
        name: "Test Pool",
        owner: "0x1234567890abcdef",
        symbol: "POOL"
      };

      const result = await deployPool(requestData);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/contracts/pool",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer test-token"
          },
          body: JSON.stringify(requestData)
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should throw error when pool deployment fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const requestData = {
        name: "Test Pool",
        owner: "0x1234567890abcdef",
        symbol: "POOL"
      };

      await expect(deployPool(requestData)).rejects.toThrow("API request failed: 500");
    });
  });

  describe("trackOTX", () => {
    it("should successfully track OTX", async () => {
      const mockResponse = {
        description: "OTX tracked successfully",
        ok: true,
        result: { 
          status: "pending",
          transactionHash: "0xdef1234567890abc"
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const trackingId = "track-123";
      const result = await trackOTX(trackingId);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/otx/track/track-123",
        {
          method: "GET",
          headers: {
            "Authorization": "Bearer test-token"
          }
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should throw error when tracking fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const trackingId = "invalid-track-id";

      await expect(trackOTX(trackingId)).rejects.toThrow("API request failed: 404");
    });
  });

  describe("deployDMR20", () => {
    it("should successfully deploy DMR20 token", async () => {
      const mockResponse = {
        description: "DMR20 token deployed successfully",
        ok: true,
        result: { trackingId: "track-dmr20-123" }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const requestData = {
        decimals: 18,
        initialMintee: "0xabcdef1234567890",
        initialSupply: "1000000",
        name: "Test DMR Token",
        owner: "0x1234567890abcdef",
        symbol: "TDMR",
        demurragePeriod: "2592000",
        demurrageRate: "196",
        sinkAddress: "0x9876543210fedcba"
      };

      const result = await deployDMR20(requestData);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/contracts/erc20-demurrage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer test-token"
          },
          body: JSON.stringify(requestData)
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should throw error when DMR20 deployment fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      const requestData = {
        decimals: 18,
        initialMintee: "0xabcdef1234567890",
        initialSupply: "1000000",
        name: "Test DMR Token",
        owner: "0x1234567890abcdef",
        symbol: "TDMR",
        demurragePeriod: "2592000",
        demurrageRate: "196",
        sinkAddress: "0x9876543210fedcba"
      };

      await expect(deployDMR20(requestData)).rejects.toThrow("API request failed: 400");
    });
  });

  describe("ERC20 Expiring deployment", () => {
    it("should successfully deploy ERC20 expiring token", async () => {
      const mockResponse = {
        description: "ERC20 expiring token deployed successfully",
        ok: true,
        result: { trackingId: "track-exp-123" }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const requestData = {
        decimals: 18,
        initialMintee: "0xabcdef1234567890",
        initialSupply: "1000000",
        name: "Test Expiring Token",
        owner: "0x1234567890abcdef",
        symbol: "TEXP",
        expiryTimestamp: "1735689600"
      };

      const result = await deployERC20(requestData);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/contracts/erc20",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer test-token"
          },
          body: JSON.stringify(requestData)
        }
      );

      expect(result).toEqual(mockResponse);
    });
  });
});

describe("Contract Address Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getContractAddressFromTxHash", () => {
    it("should successfully get contract address from transaction hash", async () => {
      const mockClient = {
        getTransactionReceipt: vi.fn().mockResolvedValue({
          contractAddress: "0x1234567890abcdef1234567890abcdef12345678"
        })
      };

      const txHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
      const result = await getContractAddressFromTxHash(mockClient as any, txHash);

      expect(mockClient.getTransactionReceipt).toHaveBeenCalledWith({
        hash: txHash
      });
      expect(result).toBe("0x1234567890AbcdEF1234567890aBcdef12345678");
    });

    it("should throw error when no contract address found", async () => {
      const mockClient = {
        getTransactionReceipt: vi.fn().mockResolvedValue({
          contractAddress: null
        })
      };

      const txHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
      
      await expect(getContractAddressFromTxHash(mockClient as any, txHash))
        .rejects.toThrow("Failed to get contract address from transaction");
    });

    it("should throw error when transaction receipt fails", async () => {
      const mockClient = {
        getTransactionReceipt: vi.fn().mockRejectedValue(new Error("Transaction not found"))
      };

      const txHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
      
      await expect(getContractAddressFromTxHash(mockClient as any, txHash))
        .rejects.toThrow("Failed to get contract address from transaction");
    });
  });
});

describe("Deployment Tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("waitForDeployment", () => {
    it("should successfully wait for deployment completion", async () => {
      const trackingId = "track-123";
      const otxType = OTXType.STANDARD_TOKEN_DEPLOY;
      const contractAddress = "0x1234567890AbcdEF1234567890aBcdef12345678";
      
      const mockTrackingResponse = {
        description: "Tracking successful",
        ok: true,
        result: {
          otx: [
            {
              id: 1,
              trackingId: "track-123",
              otxType: OTXType.STANDARD_TOKEN_DEPLOY,
              signerAccount: "0xsigner",
              rawTx: "0xrawTx",
              txHash: "0xtxHash",
              nonce: 1,
              replaced: false,
              createdAt: "2023-01-01T00:00:00Z",
              updatedAt: "2023-01-01T00:00:00Z",
              status: "SUCCESS" as const
            }
          ]
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTrackingResponse)
      });

      const { publicClient } = await import("~/config/viem.config.server");
      vi.mocked(publicClient.getTransactionReceipt).mockResolvedValue({
        contractAddress
      });

      const result = await waitForDeployment(trackingId, otxType);
      
      expect(result).toEqual({ address: contractAddress });
    });

    it("should throw error when no successful transaction found", async () => {
      const trackingId = "track-123";
      const otxType = OTXType.STANDARD_TOKEN_DEPLOY;
      
      const mockTrackingResponse = {
        description: "Tracking successful",
        ok: true,
        result: {
          otx: [
            {
              id: 1,
              trackingId: "track-123",
              otxType: OTXType.STANDARD_TOKEN_DEPLOY,
              signerAccount: "0xsigner",
              rawTx: "0xrawTx",
              txHash: "0xtxHash",
              nonce: 1,
              replaced: false,
              createdAt: "2023-01-01T00:00:00Z",
              updatedAt: "2023-01-01T00:00:00Z",
              status: "PENDING" as const
            }
          ]
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTrackingResponse)
      });

      // Mock setTimeout to avoid actual delays
      vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
        fn();
        return 0 as any;
      });
      
      await expect(waitForDeployment(trackingId, otxType))
        .rejects.toThrow(`Failed to get ${otxType} address after deployment`);
    });

    it("should handle tracking errors gracefully", async () => {
      const trackingId = "track-123";
      const otxType = OTXType.STANDARD_TOKEN_DEPLOY;
      
      mockFetch.mockRejectedValue(new Error("Network error"));

      // Mock setTimeout to avoid actual delays
      vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
        fn();
        return 0 as any;
      });
      
      await expect(waitForDeployment(trackingId, otxType))
        .rejects.toThrow(`Failed to get ${otxType} address after deployment`);
    });
  });
});