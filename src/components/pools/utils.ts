import { parseUnits } from "viem/utils";
import { getFormattedValue } from "~/utils/units";

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
