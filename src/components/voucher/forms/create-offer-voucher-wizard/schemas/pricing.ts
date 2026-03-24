import { z } from "zod";

export const pricingSchema = z.object({
  currency: z.string().trim().nonempty("Currency is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  unit: z
    .string()
    .trim()
    .nonempty("Per-unit label is required")
    .max(32, "Unit label too long"),
  quantity: z.coerce.number().nonnegative("Quantity must be positive").optional(),
  frequency: z.enum(["day", "week", "month", "year"]).optional(),
});

export type PricingFormValues = z.infer<typeof pricingSchema>;
