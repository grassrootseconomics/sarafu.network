import { z } from "zod";

export const offerSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty("Offer name is required")
    .min(2, "Offer name must be at least 2 characters")
    .max(32, "Offer name must be at most 32 characters"),
  description: z
    .string()
    .trim()
    .nonempty("Description is required")
    .min(3, "Description must be at least 3 characters")
    .max(256, "Description too long"),
  categories: z.array(z.string()).optional(),
  photo: z.optional(z.string()),
});

export type OfferFormValues = z.infer<typeof offerSchema>;
