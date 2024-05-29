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
  return rounded.toLocaleString();
};

export const toUserUnits = (value?: bigint, decimals?: number): number => {
  if (value === undefined) return 0;
  const formatted = formatUnits(value, decimals || 6);
  const rounded = roundDownToTwoDecimalPlaces(Number(formatted));
  return rounded;
};

export function minsToHuman(mins: bigint) {
  let seconds = Number(mins) * 60;
  const years = Math.floor(seconds / 31536000),
    days = Math.floor((seconds %= 31536000) / 86400),
    hours = Math.floor((seconds %= 86400) / 3600),
    minutes = Math.floor((seconds %= 3600) / 60);

  if (days || hours || seconds || minutes) {
    return (
      (years ? years + " Year " : "") +
      (days ? days + " Days " : "") +
      (hours ? hours + "Hour " : "") +
      (minutes ? minutes + "Min " : "")
    );
  }

  return "< 1s";
}

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
