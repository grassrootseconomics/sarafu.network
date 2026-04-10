/**
 * Utility functions for the paper connector
 */

/**
 * Normalizes a chain ID to a number format
 * @param chainId - The chain ID to normalize (can be string, number, or bigint)
 * @returns The normalized chain ID as a number
 * @throws {Error} If the chain ID cannot be parsed
 */
export function normalizeChainId(chainId: string | number | bigint): number {
  if (typeof chainId === "number") {
    if (!Number.isInteger(chainId) || chainId <= 0) {
      throw new Error(
        `Invalid chain ID: ${chainId}. Must be a positive integer.`
      );
    }
    return chainId;
  }

  if (typeof chainId === "bigint") {
    const numberValue = Number(chainId);
    if (numberValue <= 0 || !Number.isSafeInteger(numberValue)) {
      throw new Error(`Chain ID ${chainId} is too large or invalid.`);
    }
    return numberValue;
  }

  if (typeof chainId === "string") {
    const trimmed = chainId.trim();
    if (!trimmed) {
      throw new Error("Chain ID string cannot be empty.");
    }

    const base = trimmed.startsWith("0x") ? 16 : 10;
    const parsed = parseInt(trimmed, base);

    if (isNaN(parsed) || parsed <= 0) {
      throw new Error(
        `Invalid chain ID string: "${chainId}". Must be a valid number.`
      );
    }

    return parsed;
  }

  throw new Error(`Unsupported chain ID type: ${typeof chainId}`);
}
