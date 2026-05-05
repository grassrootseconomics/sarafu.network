import { z } from "zod";
import { isPhoneNumber, normalizePhoneNumber } from "~/utils/phone-number";
import {
  consentFields,
  expirationSchema,
  geoField,
  productSchema,
  symbolFieldWithUniqueness,
} from "./shared-fields";

export const deployVoucherInput = z.object({
  // Voucher identity
  name: z
    .string()
    .trim()
    .nonempty("Voucher name is required")
    .min(3, "Voucher name must be at least 3 characters")
    .max(32, "Voucher name must be at most 32 characters"),
  description: z
    .string()
    .trim()
    .nonempty("Voucher description is required")
    .min(3, "Description must be at least 3 characters")
    .max(256, "Description must be at most 256 characters"),
  symbol: symbolFieldWithUniqueness,

  // Value & supply
  uoa: z.string().trim(),
  value: z.coerce.number().int("Value must be an integer"),
  supply: z.coerce.number(),

  // Creator info
  email: z.string().email(),
  website: z.string().url().optional(),
  phoneNumber: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v ? v : null))
    .superRefine((v, ctx) => {
      if (v && !isPhoneNumber(v)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid phone number",
        });
      }
    })
    .transform((v) => (v ? normalizePhoneNumber(v) : null)),

  // Location
  geo: geoField,
  location: z.string().optional(),

  // Expiration
  expiration: expirationSchema,

  // Products / offers
  products: z.array(productSchema),

  // Consent
  ...consentFields,
});

export type DeployVoucherInput = z.infer<typeof deployVoucherInput>;
