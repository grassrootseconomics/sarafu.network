import { isAddress } from "viem";
import { z } from "zod";

export const addressSchema = z.custom<`0x${string}`>(
  (val) => isAddress(val as string),
  { message: "Invalid address" }
);