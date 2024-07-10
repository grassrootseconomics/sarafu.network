import { z } from "zod";
import { CommodityType } from "~/server/enums";

export const insertProductListingInput = z.object({
  commodity_name: z.string(),
  commodity_description: z.string().optional(),
  commodity_type: z.nativeEnum(CommodityType),
  quantity: z.coerce.number(),
  price: z.coerce.number(),
  frequency: z.string().optional(),
  voucher_id: z.number(),
});

export const updateProductListingInput = insertProductListingInput.extend({
  id: z.number(),
});

export type InsertProductListingInput = z.infer<
  typeof insertProductListingInput
>;
export type UpdateProductListingInput = z.infer<
  typeof updateProductListingInput
>;
