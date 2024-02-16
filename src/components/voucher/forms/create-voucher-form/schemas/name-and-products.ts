import { z } from "zod";
import { TokenIndex } from "~/contracts/erc20-token-index";
import { publicClient } from "~/lib/web3";

const tokenIndex = new TokenIndex(publicClient);

export const productSchema = z.object({
  name: z.string().trim().nonempty("Product Name is required").max(32),
  description: z.string().trim().nonempty("Description is required").max(256),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  frequency: z.enum(["day", "week", "month", "year"]),
});

export const nameAndProductsSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty("Community Asset Voucher (CAV) Name is required")
    .min(3, "CAV Name must be at least 3 characters")
    .max(32, "CAV Name must be at most 32 characters"),
  description: z
    .string()
    .trim()
    .nonempty("Voucher Description is required")
    .min(3, "Description must be at least 3 characters")
    .max(256, "Description must be at most 256 characters"),
  symbol: z
    .string()
    .trim()
    .nonempty("Symbol is required")
    .min(1, "CAV Symbol must be at least 2 characters")
    .max(6, "CAV Symbol must be at most 6 characters")
    .toUpperCase()
    .refine(
      async (value) => {
        try {
          const exists = await tokenIndex.exists(value);
          return !exists;
        } catch (error) {
          console.error(error);
        }
      },
      { message: "Symbol already exists please pick another" },
    ),
  products: z.array(productSchema).min(1, "Atleast 1 product is required"),
});
export type NameAndProductsFormValues = z.infer<typeof nameAndProductsSchema>;
