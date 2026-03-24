import { isAddress } from "viem";
import { z } from "zod";
import { VoucherIndex } from "~/contracts";
import { VoucherType } from "~/server/enums";

export const voucherStepSchema = z
  .object({
    name: z
      .string()
      .trim()
      .nonempty("Voucher name is required")
      .min(3, "Voucher name must be at least 3 characters")
      .max(32, "Voucher name must be at most 32 characters"),
    shopDescription: z
      .string()
      .trim()
      .max(256, "Description too long")
      .optional(),
    value: z.coerce
      .number()
      .int("Value must be a whole number")
      .positive("Value must be greater than 0"),

    // Advanced settings
    uoa: z.string().trim().nonempty("Unit of account is required"),
    symbol: z
      .string()
      .trim()
      .nonempty("Symbol is required")
      .min(1, "Symbol must be at least 1 character")
      .max(6, "Symbol must be at most 6 characters")
      .toUpperCase()
      .refine(
        async (value) => {
          try {
            const exists = await VoucherIndex.exists(value);
            return !exists;
          } catch {
            return true;
          }
        },
        { message: "Symbol already exists, please pick another" }
      ),
    location: z.string().optional(),
    geo: z
      .object({
        x: z.number(),
        y: z.number(),
      })
      .optional(),
    supply: z.coerce.number().positive("Supply must be positive").optional(),
    contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    voucherType: z.enum([
      VoucherType.GIFTABLE,
      VoucherType.GIFTABLE_EXPIRING,
      VoucherType.DEMURRAGE,
    ]),

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
  })
  .superRefine((data, ctx) => {
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
  });

export type VoucherStepFormValues = z.infer<typeof voucherStepSchema>;
