import { parseUnits } from "viem/utils";
import { fromRawPriceIndex } from "~/utils/units/pool";
import { getFormattedValue } from "~/utils/units/token";
import { type SwapPoolVoucher } from "./types";

export function convert(
  fromAmount: string | undefined,
  fromToken?: {
    decimals: number;
    priceIndex: bigint;
  },
  toToken?: {
    decimals: number;
    priceIndex: bigint;
  }
) {
  if (!fromToken || !toToken) return undefined;
  const exchangeRate =
    Number(fromToken.priceIndex) / Number(toToken.priceIndex);

  const toAmount = Number(fromAmount ?? 0) * exchangeRate;
  return getFormattedValue(
    parseUnits(toAmount.toString(), toToken.decimals),
    toToken.decimals
  );
}

export function getHoldingInDefaultVoucherUnits(
  voucher: SwapPoolVoucher
): number {
  return (
    Number(voucher.poolBalance?.formattedNumber ?? 0) *
    fromRawPriceIndex(voucher.priceIndex)
  );
}
export function getLimitInDefaultVoucherUnits(
  voucher: SwapPoolVoucher
): number {
  const limit = voucher.limitOf?.formattedNumber ?? 0;
  const relativeRate = fromRawPriceIndex(voucher.priceIndex);
  return Number(limit * relativeRate);
}
export function getPercentage(voucher: SwapPoolVoucher): number {
  const limit = voucher.limitOf?.formattedNumber ?? 0;
  const poolBalance = voucher.poolBalance?.formattedNumber ?? 0;
  return limit === 0 ? 0 : ((limit - poolBalance) / limit) * 100;
}
export function getAvailableCreditInDefaultVoucherUnits(
  voucher: SwapPoolVoucher
): number {
  const holdingInDV = getHoldingInDefaultVoucherUnits(voucher);
  const limitInDV = getLimitInDefaultVoucherUnits(voucher);
  const creditInDV = limitInDV - holdingInDV;
  return creditInDV;
}

/**
 * Calculates the user's total purchasing power for a target voucher.
 *
 * Sub-formulas (for each voucher V_n where n ≠ target):
 *
 *   1. V_n_swappable    = min(V_n_user_balance, max(0, V_n_limit − V_n_pool_balance))
 *   2. V_n_credit       = V_n_swappable × V_n_rate
 *   3. total_credit     = Σ V_n_credit                (for all n ≠ target)
 *   4. pool_holdings     = V_target_pool_balance × V_target_rate
 *   5. V_target_credit   = min(total_credit, pool_holdings)
 */
export function getTotalPurchasingPower(
  targetAddress: string,
  targetDetail: SwapPoolVoucher | undefined,
  allDetails: Map<string, SwapPoolVoucher>,
): number {
  // (4) pool_holdings = V_target_pool_balance × V_target_rate
  const poolHoldings = targetDetail
    ? getHoldingInDefaultVoucherUnits(targetDetail)
    : 0;

  // (1–3) Sum V_n_credit across all non-target vouchers
  let totalCredit = 0;
  for (const [addr, detail] of allDetails) {
    if (addr === targetAddress.toLowerCase()) continue;
    // (1) V_n_swappable = min(V_n_user_balance, max(0, V_n_limit − V_n_pool_balance))
    const swappable = Math.min(
      detail.userBalance?.formattedNumber ?? 0,
      Math.max(0, detail.swapLimit?.formattedNumber ?? 0),
    );
    // (2) V_n_credit = V_n_swappable × V_n_rate
    totalCredit += swappable * fromRawPriceIndex(detail.priceIndex);
  }

  // (5) V_target_credit = min(total_credit, pool_holdings)
  return Math.min(totalCredit, poolHoldings);
}
