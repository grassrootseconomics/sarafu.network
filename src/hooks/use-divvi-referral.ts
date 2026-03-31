"use client";

import { useCallback } from "react";
import { useAccount, useChainId } from "wagmi";
import { submitDivviReferral, createDivviReferralTag } from "~/utils/divvi";

/**
 * Hook for integrating Divvi referral tracking into transactions
 *
 * @returns Object containing:
 *   - getReferralTag: Function to generate a referral tag for the current user
 *   - submitReferral: Function to submit a transaction hash for referral tracking
 *   - isReady: Boolean indicating if the hook is ready (user is connected)
 */
export function useDivviReferral() {
  const { address } = useAccount();
  const chainId = useChainId();

  /**
   * Generate a referral tag for the current connected user
   *
   * @param providers - Optional array of provider addresses
   * @returns The referral tag as a hex string for use with dataSuffix, or undefined if not connected
   */
  const getReferralTag = useCallback(
    (providers?: readonly `0x${string}`[]): `0x${string}` | undefined => {
      if (!address) {
        return undefined;
      }
      return createDivviReferralTag(address, providers);
    },
    [address]
  );

  /**
   * Submit a transaction for Divvi referral tracking
   *
   * @param txHash - The transaction hash to submit
   */
  const submitReferral = useCallback(
    async (txHash: `0x${string}`): Promise<void> => {
      await submitDivviReferral(txHash, chainId);
    },
    [chainId]
  );

  return {
    getReferralTag,
    submitReferral,
    isReady: !!address,
  };
}
