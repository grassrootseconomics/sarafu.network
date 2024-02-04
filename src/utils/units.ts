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