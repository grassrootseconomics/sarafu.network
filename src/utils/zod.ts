import { isAddress } from "viem";
import { z } from "zod";
import { normalizeDateRange } from "./units/date";

export const addressSchema = z.custom<`0x${string}`>(
  (val) => isAddress(val as string),
  { message: "Invalid address" }
);


/**
 * Zod schema for date ranges that automatically normalizes dates:
 * - 'from' is set to start of day (00:00:00.000)
 * - 'to' is set to end of day (23:59:59.999)
 * This ensures consistent cache keys and proper date boundary handling
 */
export const normalizedDateRangeSchema = z
  .object({
    from: z.date(),
    to: z.date(),
  })
  .transform((val) => normalizeDateRange(val.from, val.to));