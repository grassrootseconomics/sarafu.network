import { formatUnits } from "viem";
import { truncateByDecimalPlace } from "./number";

function roundDownToTwoDecimalPlaces(num: number): number {
  return Math.floor(num * 100) / 100;
}

export const toUserUnitsString = (
  value?: bigint,
  decimals?: number
): string => {
  if (value === undefined) return "0";
  const formatted = formatUnits(value, decimals || 6);
  const rounded = roundDownToTwoDecimalPlaces(Number(formatted));
  if (rounded === 0) return Number(formatted).toPrecision(3).toString();
  return rounded.toLocaleString();
};

export type TokenValue = {
  formatted: string;
  formattedNumber: number;
  value: bigint;
  decimals: number;
};

export function getFormattedValue(
  value: bigint | undefined,
  decimals: number | undefined
): TokenValue | undefined {
  if (!decimals) return undefined;
  if (!value || typeof value !== "bigint")
    return {
      formatted: "0",
      formattedNumber: 0,
      value: 0n,
      decimals: decimals,
    };
  const val = {
    formatted: truncateByDecimalPlace(
      Number(formatUnits(value, decimals)),
      2
    ).toString(),
    formattedNumber: Number(formatUnits(value, decimals)),
    value: value,
    decimals: decimals,
  };
  return val;
}