import { isAddress, type Address } from "viem";
import { env } from "~/env";
import { trpc } from "../trpc";

/**
 * Base API response structure
 */
interface BaseResponse {
  ok: boolean;
  description: string;
}

/**
 * Error response from Sarafu resolver API
 */
interface ErrorResponse extends BaseResponse {
  ok: false;
}

/**
 * Successful ENS registration response
 */
interface RegistrationSuccessResponse extends BaseResponse {
  ok: true;
  result: {
    address: Address;
    autoChoose: boolean;
    name: string;
  };
}

/**
 * Successful ENS update response
 */
interface UpdateSuccessResponse extends BaseResponse {
  ok: true;
  result: {
    address: Address;
    name: string;
  };
}

/**
 * ENS forward resolution response
 */
interface ForwardResolutionResponse extends BaseResponse {
  ok: true;
  result: {
    address: Address;
  };
}

/**
 * ENS reverse resolution response
 */
interface ReverseResolutionResponse extends BaseResponse {
  ok: true;
  result: {
    name: string;
  };
}

/**
 * Union types for API responses
 */
type RegistrationResponse = ErrorResponse | RegistrationSuccessResponse;
type UpdateResponse = ErrorResponse | UpdateSuccessResponse;
type ENSResolutionResponse = ErrorResponse | ForwardResolutionResponse;
type ReverseENSResolutionResponse = ErrorResponse | ReverseResolutionResponse;

/**
 * Parameters for ENS resolution by address
 */
interface ResolveByAddressParams {
  address: Address;
}

/**
 * Parameters for ENS resolution by name
 */
interface ResolveByNameParams {
  ensName: string;
}

/**
 * Union type for ENS resolution parameters
 */
export type ENSResolutionParams = ResolveByAddressParams | ResolveByNameParams;

/**
 * Custom error class for ENS resolver operations
 */
class ENSResolverError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "ENSResolverError";
  }
}

/**
 * Validates environment variables required for ENS operations
 */
function validateEnvironment(): void {
  if (!env.SARAFU_RESOLVER_API_URL) {
    throw new ENSResolverError("SARAFU_RESOLVER_API_URL is not configured");
  }
  if (!env.SARAFU_RESOLVER_API_TOKEN) {
    throw new ENSResolverError("SARAFU_RESOLVER_API_TOKEN is not configured");
  }
}

/**
 * Creates standardized headers for API requests
 */
function createHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.SARAFU_RESOLVER_API_TOKEN}`,
  };
}

/**
 * Registers an ENS name for a given address with optional hint
 *
 * @param address - The Ethereum address to register
 * @param hint - Optional hint for name generation
 * @returns Promise resolving to the registered ENS name
 * @throws {ENSResolverError} When registration fails
 */
export async function registerENS(
  address: Address,
  hint: string
): Promise<string> {
  validateEnvironment();

  try {
    const response = await fetch(
      `${env.SARAFU_RESOLVER_API_URL}/api/v1/internal/register`,
      {
        method: "POST",
        headers: createHeaders(),
        body: JSON.stringify({ address, hint }),
      }
    );

    if (!response.ok) {
      throw new ENSResolverError(
        `HTTP ${response.status}: ${response.statusText}`,
        "HTTP_ERROR"
      );
    }

    const data = (await response.json()) as RegistrationResponse;

    if (!data.ok) {
      throw new ENSResolverError(data.description, "API_ERROR");
    }

    return data.result.name;
  } catch (error) {
    if (error instanceof ENSResolverError) {
      throw error;
    }
    throw new ENSResolverError(
      `Failed to register ENS: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      "NETWORK_ERROR"
    );
  }
}

/**
 * Updates an existing ENS name with a new address
 *
 * @param name - The ENS name to update
 * @param address - The new Ethereum address to associate with the name
 * @returns Promise resolving to the update result
 * @throws {ENSResolverError} When update fails
 */
export async function updateENS(
  name: string,
  address: Address
): Promise<{ address: Address; name: string }> {
  validateEnvironment();

  try {
    const response = await fetch(
      `${env.SARAFU_RESOLVER_API_URL}/api/v1/internal/update`,
      {
        method: "PUT",
        headers: createHeaders(),
        body: JSON.stringify({ name, address }),
      }
    );

    if (!response.ok) {
      throw new ENSResolverError(
        `HTTP ${response.status}: ${response.statusText}`,
        "HTTP_ERROR"
      );
    }

    const data = (await response.json()) as UpdateResponse;

    if (!data.ok) {
      throw new ENSResolverError(data.description, "API_ERROR");
    }

    return data.result;
  } catch (error) {
    if (error instanceof ENSResolverError) {
      throw error;
    }
    throw new ENSResolverError(
      `Failed to update ENS: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      "NETWORK_ERROR"
    );
  }
}

/**
 * Resolves ENS name to address or address to ENS name
 *
 * @param params - Either address or ENS name to resolve
 * @returns Promise resolving to resolution result or null if not found
 */
export async function getAddressFromENS(
  params: ResolveByNameParams
): Promise<{ address: Address } | null> {
  validateEnvironment();

  try {
    const endpoint = `/api/v1/resolve/${params.ensName}`;
    const url = `${env.SARAFU_RESOLVER_API_URL}${endpoint}`;
    console.log("url", url);
    const response = await fetch(url, {
      headers: createHeaders(),
    });

    const data = (await response.json()) as ENSResolutionResponse;
    console.log("data", data);
    if (!data.ok) {
      return null;
    }

    return data.result;
  } catch (error) {
    if (error instanceof ENSResolverError) {
      throw error;
    }
    // Return null for resolution failures to maintain backward compatibility
    return null;
  }
}

/**
 * Resolves ENS name to addres
 *
 * @param params - ENS name to resolve
 * @returns Promise resolving to resolution result or null if not found
 */
export async function getENSFromAddress(
  params: ResolveByAddressParams
): Promise<{ name: string } | null> {
  validateEnvironment();

  try {
    const endpoint = `/api/v1/resolve/reverse/${params.address}`;

    const response = await fetch(`${env.SARAFU_RESOLVER_API_URL}${endpoint}`, {
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new ENSResolverError(
        `HTTP ${response.status}: ${response.statusText}`,
        "HTTP_ERROR"
      );
    }

    const data = (await response.json()) as ReverseENSResolutionResponse;

    if (!data.ok) {
      return null;
    }

    return data.result;
  } catch (error) {
    if (error instanceof ENSResolverError) {
      throw error;
    }
    // Return null for resolution failures to maintain backward compatibility
    return null;
  }
}
/**
 * Hook for resolving ENS names from addresses
 *
 * @param address - The Ethereum address to resolve
 * @returns Object containing both ENS resolution results
 */
export function useENS({ address }: { address: Address | undefined }) {
  return trpc.ens.getENS.useQuery(
    { address: address! },
    {
      enabled: Boolean(address) && isAddress(address!),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useENSExists({ ensName }: { ensName: string }) {
  return trpc.ens.exists.useQuery({ ensName });
}

/**
 * Hook for resolving addresses from ENS names
 * Only resolves .eth domains
 *
 * @param ensName - The ENS name to resolve
 * @returns Query result containing address resolution
 */
export function useENSAddress({ ensName }: { ensName: string }) {
  const isValidENSName = Boolean(ensName && ensName.endsWith(".eth"));

  return trpc.ens.getAddress.useQuery(
    { ensName },
    {
      enabled: isValidENSName,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Type guard to check if resolution parameters contain an address
 */
export function isAddressResolution(
  params: ENSResolutionParams
): params is ResolveByAddressParams {
  return "address" in params;
}

/**
 * Type guard to check if resolution parameters contain an ENS name
 */
export function isNameResolution(
  params: ENSResolutionParams
): params is ResolveByNameParams {
  return "ensName" in params;
}
