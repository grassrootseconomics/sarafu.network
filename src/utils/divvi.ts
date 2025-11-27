import { getReferralTag, submitReferral } from "@divvi/referral-sdk";

/**
 * Divvi Consumer Address for Sarafu Network
 * This is the identifier for Sarafu Network in the Divvi ecosystem
 */
export const DIVVI_CONSUMER_ADDRESS =
  "0x5523058cdFfe5F3c1EaDADD5015E55C6E00fb439" as const;

/**
 * Celo chain ID
 */
export const CELO_CHAIN_ID = 42220;

/**
 * Creates a referral tag for Divvi attribution
 *
 * @param user - The user address making the transaction
 * @param providers - Optional array of provider addresses for additional attribution
 * @returns The referral tag as a hex string (without 0x prefix)
 */
export function createDivviReferralTag(
  user: `0x${string}`,
  providers?: readonly `0x${string}`[]
): string {
  return getReferralTag({
    user,
    consumer: DIVVI_CONSUMER_ADDRESS,
    providers,
  });
}

/**
 * Submits a referral attribution to the Divvi tracking API
 *
 * @param txHash - The transaction hash to submit for referral tracking
 * @param chainId - The chain ID (defaults to Celo mainnet)
 * @returns A promise that resolves when the submission is complete
 * @throws {Error} If the API request fails
 */
export async function submitDivviReferral(
  txHash: `0x${string}`,
  chainId: number = CELO_CHAIN_ID
): Promise<void> {
  try {
    const response = await submitReferral({
      txHash,
      chainId,
    });

    if (!response.ok) {
      throw new Error(
        `Divvi referral submission failed: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    // Log the error but don't throw - referral tracking is non-critical
    console.error("Failed to submit Divvi referral:", error);
  }
}

/**
 * Appends a Divvi referral tag to existing transaction data.
 * This is useful for USSD or custodial wallet flows where the referral tag
 * needs to be included directly in the transaction calldata.
 *
 * @param data - The original transaction data
 * @param user - The user address making the transaction
 * @param providers - Optional array of provider addresses
 * @returns The transaction data with the referral tag appended
 */
export function appendDivviReferralTag(
  data: `0x${string}`,
  user: `0x${string}`,
  providers?: readonly `0x${string}`[]
): `0x${string}` {
  const referralTag = createDivviReferralTag(user, providers);
  return `${data}${referralTag}` as `0x${string}`;
}
