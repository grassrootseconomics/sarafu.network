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
