import { type useSwapPool } from "./hooks";

export type SwapPool = ReturnType<typeof useSwapPool>["data"];
export type SwapPoolVoucher = Exclude<
  SwapPool,
  undefined
>["voucherDetails"][number];
