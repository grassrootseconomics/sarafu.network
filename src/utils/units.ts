import { formatUnits } from "viem";

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
  return rounded.toLocaleString();
};

export const toUserUnits = (value?: bigint, decimals?: number): number => {
  if (value === undefined) return 0;
  const formatted = formatUnits(value, decimals || 6);
  const rounded = roundDownToTwoDecimalPlaces(Number(formatted));
  return rounded;
};
