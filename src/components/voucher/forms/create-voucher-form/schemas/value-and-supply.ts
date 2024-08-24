import { z } from "zod";
export const valueAndSupplySchema = z.object({
  uoa: z.string().trim(),
  value: z.coerce.number().int('Value must be an integer. '),
  supply: z.coerce.number(), // Initial Mint
});
export type ValueAndSupplyFormValues = z.infer<typeof valueAndSupplySchema>;
