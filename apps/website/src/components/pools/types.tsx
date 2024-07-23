import { type getSwapPool } from "./contract-functions";

export type SwapPool = Awaited<ReturnType<typeof getSwapPool>>;
export type SwapPoolVoucher = Exclude<
  SwapPool,
  undefined
>["voucherDetails"][number];
