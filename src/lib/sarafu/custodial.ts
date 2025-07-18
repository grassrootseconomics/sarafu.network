import { getAddress } from "viem";
import { publicClient } from "~/config/viem.config.server";
import { env } from "~/env";

const url = env.SARAFU_CUSTODIAL_API_URL;
const token = env.SARAFU_CUSTODIAL_API_TOKEN;

async function apiRequest<T>(
  endpoint: string,
  options: {
    method: "GET" | "POST";
    body?: unknown;
    includeContentType?: boolean;
  }
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (options.includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${url}${endpoint}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<ApiResponse<T>>;
}

interface ApiResponse<T = unknown> {
  description: string;
  ok: boolean;
  result: T;
}

interface ERC20DeployRequest {
  decimals: number;
  initialMintee: string;
  initialSupply: string;
  name: string;
  owner: string;
  symbol: string;
}

interface ERC20ExpiringDeployRequest extends ERC20DeployRequest {
  expiryTimestamp: string;
}

interface DMR20DeployRequest extends ERC20DeployRequest {
  demurragePeriod: string;
  demurrageRate: string;
  sinkAddress: string;
}
interface PoolDeployRequest {
  name: string;
  owner: string;
  symbol: string;
}

interface OTXTransaction {
  id: number;
  trackingId: string;
  otxType: OTXType;
  signerAccount: string;
  rawTx: string;
  txHash: string;
  nonce: number;
  replaced: boolean;
  createdAt: string;
  updatedAt: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
}

type OTXTrackingResponse = ApiResponse<{ otx: OTXTransaction[] }>;
type DeploymentResponse = ApiResponse<{ trackingId: string }>;
export async function deployERC20(
  data: ERC20DeployRequest | ERC20ExpiringDeployRequest
): Promise<DeploymentResponse> {
  console.log(JSON.stringify(data, null, 2));
  return apiRequest<{ trackingId: string }>("/contracts/erc20", {
    method: "POST",
    body: data,
    includeContentType: true,
  });
}

export async function deployDMR20(
  data: DMR20DeployRequest
): Promise<DeploymentResponse> {
  return apiRequest<{ trackingId: string }>("/contracts/erc20-demurrage", {
    method: "POST",
    body: data,
    includeContentType: true,
  });
}

export async function deployPool(
  data: PoolDeployRequest
): Promise<DeploymentResponse> {
  return apiRequest<{ trackingId: string }>("/contracts/pool", {
    method: "POST",
    body: data,
    includeContentType: true,
  });
}

export async function trackOTX(
  trackingId: string
): Promise<OTXTrackingResponse> {
  return apiRequest<{ otx: OTXTransaction[] }>(`/otx/track/${trackingId}`, {
    method: "GET",
  });
}

export async function getContractAddressFromTxHash(
  client: typeof publicClient,
  txHash: string
): Promise<`0x${string}`> {
  try {
    const receipt = await client.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });
    if (receipt.contractAddress) {
      return getAddress(receipt.contractAddress);
    }
    throw new Error("No contract address found in transaction receipt");
  } catch (error) {
    console.error("Error getting contract address from tx hash:", error);
    throw new Error("Failed to get contract address from transaction");
  }
}
export enum OTXType {
  STANDARD_TOKEN_DEPLOY = "STANDARD_TOKEN_DEPLOY",
  EXPIRING_TOKEN_DEPLOY = "EXPIRING_TOKEN_DEPLOY",
  DEMURRAGE_TOKEN_DEPLOY = "DEMURRAGE_TOKEN_DEPLOY",
  SWAPPOOL_DEPLOY = "SWAPPOOL_DEPLOY",
  GAS_REFILL = "GAS_REFILL",
  ACCOUNT_REGISTER = "ACCOUNT_REGISTER",
  GAS_TRANSFER = "GAS_TRANSFER",
  TOKEN_TRANSFER = "TOKEN_TRANSFER",
  TOKEN_APPROVE = "TOKEN_APPROVE",
  TOKEN_SWEEP = "TOKEN_SWEEP",
  POOL_SWAP = "POOL_SWAP",
  POOL_DEPOSIT = "POOL_DEPOSIT",
  OTHER_MANUAL = "OTHER_MANUAL",
  GENERIC_SIGN = "GENERIC_SIGN",
  TRANSFER_OWNERSHIP = "TRANSFER_OWNERSHIP",
  TOKEN_INDEX_ADD = "TOKEN_INDEX_ADD",
  POOL_DEPLOY = "POOL_DEPLOY",
  TOKEN_INDEX_DEPLOY = "TOKEN_INDEX_DEPLOY",
  LIMITER_DEPLOY = "LIMITER_DEPLOY",
  PRICEINDEXQUOTER_DEPLOY = "PRICEINDEXQUOTER_DEPLOY",
  POOL_INDEX_ADD = "POOL_INDEX_ADD",
  SET_QUOTER = "SET_QUOTER",
}
export async function waitForDeployment(
  trackingId: string,
  otxType: OTXType
): Promise<{ address: `0x${string}` }> {
  let contractAddress: `0x${string}` | null = null;
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts && !contractAddress) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const trackingResponse = await trackOTX(trackingId);
      console.log(JSON.stringify(trackingResponse, null, 2));
      const voucherTransaction = trackingResponse.result.otx.find(
        (tx) => tx.otxType === otxType && tx.status === "SUCCESS"
      );

      if (voucherTransaction) {
        const deployedContractAddress = await getContractAddressFromTxHash(
          publicClient,
          voucherTransaction.txHash
        );
        contractAddress = deployedContractAddress;
        break;
      }
    } catch (error) {
      console.error("Error tracking OTX:", error);
    }

    attempts++;
  }

  if (!contractAddress) {
    throw new Error(`Failed to get ${otxType} address after deployment`);
  }

  return { address: contractAddress };
}
