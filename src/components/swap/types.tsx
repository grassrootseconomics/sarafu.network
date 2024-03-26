import { type useSwapPool } from "./hooks";

export type SwapPool = ReturnType<typeof useSwapPool>;
export type SwapPoolVoucher = SwapPool["voucherDetails"]["data"][number];

export type TokenValue = {
  formatted: string;
  formattedNumber: number;
  value: bigint;
  decimals: number;
};
