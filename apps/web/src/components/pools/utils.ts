import { parseUnits } from "viem/utils";
import { fromRawPriceIndex } from "@sarafu/core/units/pool";
import { truncateByDecimalPlace } from "@sarafu/core/units/number";
import { getFormattedValue } from "@sarafu/core/units/token";
import { type SwapPoolVoucher } from "./types";

export const MIN_SWAP_AMOUNT = 0.01;

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
      detail.swapLimit?.formattedNumber ?? 0,
    );
    // (2) V_n_credit = V_n_swappable × V_n_rate
    totalCredit += swappable * fromRawPriceIndex(detail.priceIndex);
  }

  // (5) V_target_credit = min(total_credit, pool_holdings)
  return Math.min(totalCredit, poolHoldings);
}

export const isVoucherLike = (
  value: unknown,
): value is Pick<SwapPoolVoucher, "address"> =>
  typeof value === "object" &&
  value !== null &&
  "address" in value &&
  typeof (value as { address?: unknown }).address === "string";

export const getVoucherAddressKey = (value: unknown) =>
  isVoucherLike(value) ? value.address : value;

export function getSwapErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "An error occurred while swapping";
  const msg = error.message.toLowerCase();

  if (msg.includes("user rejected") || msg.includes("user denied"))
    return "Transaction was rejected in your wallet";
  if (msg.includes("insufficient funds"))
    return "Insufficient funds to cover gas fees";
  if (msg.includes("gas required exceeds allowance"))
    return "Transaction would exceed gas limits";

  const shortMsg = (error as { shortMessage?: string }).shortMessage;
  if (shortMsg) return shortMsg;

  const reason = (error as { cause?: { reason?: string } }).cause?.reason;
  if (reason) return reason;

  return error.message;
}

type ConvertibleToken = { decimals: number; priceIndex: bigint };

function asConvertible(
  token: SwapPoolVoucher,
): ConvertibleToken | undefined {
  if (token.decimals === undefined || token.priceIndex === undefined)
    return undefined;
  return token as ConvertibleToken;
}

export function getMaxSwappable(
  fromToken: SwapPoolVoucher | undefined,
  toToken: SwapPoolVoucher | undefined,
): number {
  if (!fromToken || !toToken) return 0;
  const from = asConvertible(fromToken);
  const to = asConvertible(toToken);
  if (!from || !to) return 0;

  const toAmountMax = convert(toToken.poolBalance?.formatted, to, from);
  return (
    truncateByDecimalPlace(
      Math.max(
        0,
        Math.min(
          fromToken.swapLimit?.formattedNumber ?? 0,
          fromToken.userBalance?.formattedNumber ?? 0,
          toAmountMax?.formattedNumber ?? 0,
        ),
      ),
      2,
    ) ?? 0
  );
}

export function findBestFromToken(
  voucherDetails: SwapPoolVoucher[],
  toToken: SwapPoolVoucher,
): SwapPoolVoucher | null {
  const to = asConvertible(toToken);
  if (!to) return null;

  let bestVoucher: SwapPoolVoucher | null = null;
  let bestOutput = 0;

  for (const voucher of voucherDetails) {
    if (voucher.address === toToken.address) continue;
    if ((voucher.userBalance?.formattedNumber ?? 0) <= MIN_SWAP_AMOUNT) continue;

    const from = asConvertible(voucher);
    if (!from) continue;

    const toAmountMax = convert(toToken.poolBalance?.formatted, to, from);
    const maxSwap = Math.max(
      0,
      Math.min(
        voucher.swapLimit?.formattedNumber ?? 0,
        voucher.userBalance?.formattedNumber ?? 0,
        toAmountMax?.formattedNumber ?? 0,
      ),
    );
    if (maxSwap <= 0) continue;

    const output = convert(maxSwap.toString(), from, to);
    if (output && output.formattedNumber > bestOutput) {
      bestOutput = output.formattedNumber;
      bestVoucher = voucher;
    }
  }

  return bestVoucher;
}
