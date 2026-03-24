import { isAddress } from "viem";
import { z } from "zod";
import { VoucherIndex } from "~/contracts";
import { VoucherType } from "~/server/enums";

// ── Symbol ──────────────────────────────────────────────────────────
export const symbolField = z
  .string()
  .trim()
  .nonempty("Symbol is required")
  .min(1, "Symbol must be at least 1 character")
  .max(6, "Symbol must be at most 6 characters")
  .toUpperCase();

export const symbolFieldWithUniqueness = symbolField.refine(
  async (value) => {
    try {
      const exists = await VoucherIndex.exists(value);
      return !exists;
    } catch {
      return true;
    }
  },
  { message: "Symbol already exists, please pick another" },
);

// ── Consent ─────────────────────────────────────────────────────────
export const consentFields = {
  pathLicense: z.boolean().refine((value) => value === true, {
    message: "You must accept the PATH license",
  }),
  termsAndConditions: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and conditions",
  }),
};

// ── Geo ─────────────────────────────────────────────────────────────
export const geoField = z
  .object({
    x: z.number(),
    y: z.number(),
  })
  .optional();

// ── Product ─────────────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().trim().nonempty("Name is required").max(32),
  description: z.string().trim().max(256).optional(),
  quantity: z.coerce.number().nonnegative("Quantity must be positive"),
  frequency: z.enum(["day", "week", "month", "year"]),
  image_url: z.string().url().optional(),
});

// ── Expiration ──────────────────────────────────────────────────────
export const expirationTypeEnum = z.enum([
  VoucherType.GIFTABLE,
  VoucherType.GIFTABLE_EXPIRING,
  VoucherType.DEMURRAGE,
]);

const noExpirySchema = z.object({
  type: z.literal(VoucherType.GIFTABLE),
});

const dateExpirySchema = z.object({
  type: z.literal(VoucherType.GIFTABLE_EXPIRING),
  expirationDate: z.date(),
});

const gradualExpirySchema = z.object({
  type: z.literal(VoucherType.DEMURRAGE),
  rate: z.coerce
    .number()
    .positive("Demurrage Rate must be positive")
    .max(99, "Demurrage Rate must be less than 100")
    .min(0, "Demurrage Rate must be greater than 0")
    .refine((value) => !isNaN(value), {
      message: "Demurrage Rate must be a number",
    }),
  period: z.coerce
    .number()
    .positive("Period Minutes must be a positive integer")
    .int("Period Minutes must be a positive integer")
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: "Period Minutes must be a positive integer",
    }),
  communityFund: z
    .string()
    .nonempty("Default Sink Address is required")
    .refine(isAddress, { message: "Invalid address format" }),
});

export const expirationSchema = z.discriminatedUnion("type", [
  noExpirySchema,
  dateExpirySchema,
  gradualExpirySchema,
]);

export type ExpirationFormValues = z.infer<typeof expirationSchema>;
