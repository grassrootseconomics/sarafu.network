"use client";

import { useCallback } from "react";
import { useAccount, useChainId } from "wagmi";
import type { Hex } from "viem";
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
   * @returns The referral tag as a hex string, or empty string if not connected
   */
  const getReferralTag = useCallback(
    (providers?: readonly `0x${string}`[]): string => {
      if (!address) {
        return "";
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
    async (txHash: Hex): Promise<void> => {
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
