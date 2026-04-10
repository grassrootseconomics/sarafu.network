import { isAddress } from "viem";
import { z } from "zod";
import {
  expirationTypeEnum,
  geoField,
  symbolField,
} from "@sarafu/schemas/voucher";
import { symbolFieldWithUniqueness } from "@sarafu/api/schemas/shared-fields";
import { VoucherType } from "@sarafu/core/enums";

const voucherStepFields = {
  name: z
    .string()
    .trim()
    .nonempty("Voucher name is required")
    .min(3, "Voucher name must be at least 3 characters")
    .max(32, "Voucher name must be at most 32 characters"),
  shopDescription: z
    .string()
    .trim()
    .nonempty("Voucher description is required")
    .min(3, "Description must be at least 3 characters")
    .max(256, "Description too long"),
  value: z.coerce
    .number()
    .int("Value must be a whole number")
    .positive("Value must be greater than 0"),

  // Advanced settings
  uoa: z.string().trim().nonempty("Unit of account is required"),
  location: z.string().optional(),
  geo: geoField,
  supply: z.coerce.number().positive("Supply must be positive").optional(),
  contactEmail: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),
  voucherType: expirationTypeEnum,

  // Conditional fields
  expirationDate: z.date().optional(),
  demurrageRate: z.coerce
    .number()
    .positive("Rate must be positive")
    .max(99, "Rate must be less than 100")
    .optional(),
  demurragePeriod: z.coerce
    .number()
    .positive("Period must be positive")
    .int("Period must be a whole number")
    .optional(),
  communityFund: z.string().optional(),
};

function conditionalValidation(
  data: { voucherType: string; expirationDate?: Date; demurrageRate?: number; demurragePeriod?: number; communityFund?: string },
  ctx: z.RefinementCtx
) {
  if (data.voucherType === VoucherType.GIFTABLE_EXPIRING) {
    if (!data.expirationDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expiration date is required",
        path: ["expirationDate"],
      });
    }
  }
  if (data.voucherType === VoucherType.DEMURRAGE) {
    if (!data.demurrageRate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Demurrage rate is required",
        path: ["demurrageRate"],
      });
    }
    if (!data.demurragePeriod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Period is required",
        path: ["demurragePeriod"],
      });
    }
    if (!data.communityFund) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Community fund address is required",
        path: ["communityFund"],
      });
    } else if (!isAddress(data.communityFund)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid address format",
        path: ["communityFund"],
      });
    }
  }
}

/** Synchronous schema for pre-check validation (no async symbol uniqueness check) */
export const voucherStepSchemaSync = z
  .object({
    ...voucherStepFields,
    symbol: symbolField,
  })
  .superRefine(conditionalValidation);

/** Full schema with async symbol uniqueness check (used for form validation and deploy) */
export const voucherStepSchema = z
  .object({
    ...voucherStepFields,
    symbol: symbolFieldWithUniqueness,
  })
  .superRefine(conditionalValidation);

export type VoucherStepFormValues = z.infer<typeof voucherStepSchema>;
