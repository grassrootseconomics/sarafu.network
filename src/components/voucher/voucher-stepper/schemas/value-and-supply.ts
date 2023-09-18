import { z } from "zod";
export const valueAndSupplySchema = z.object({
  uoa: z.string(),
  value: z.coerce.number(),
  supply: z.coerce.number(), // Initial Mint
});
export type ValueAndSupplyFormValues = z.infer<typeof valueAndSupplySchema>;
