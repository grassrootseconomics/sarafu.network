import { isAddress } from "viem";
import { z } from "zod";
import { CommodityType } from "~/server/enums";

const baseProductListingSchema = z.object({
  commodity_name: z.string().min(1, "Commodity name is required"),
  commodity_description: z.string().min(1, "Commodity description is required"),
  commodity_type: z.nativeEnum(CommodityType),
  quantity: z.coerce.number().nullable(),
  price: z.coerce.number().nullable(),
  frequency: z.string().nullable(),
  image_url: z.string().url("Must be a valid URL").optional().nullable(),
  voucher_address: z.custom<`0x${string}`>(
    (val) => isAddress(val as string),
    "Must be a valid address"
  ),
});

export const insertProductListingInput = baseProductListingSchema;

export const updateProductListingInput = baseProductListingSchema.extend({
  id: z.number(),
});

export type InsertProductListingInput = z.infer<
  typeof insertProductListingInput
>;
export type UpdateProductListingInput = z.infer<
  typeof updateProductListingInput
>;

export type ProductFormInput =
  | InsertProductListingInput
  | UpdateProductListingInput;
