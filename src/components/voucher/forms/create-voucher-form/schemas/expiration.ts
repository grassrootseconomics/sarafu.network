import { isAddress } from "viem";
import { z } from "zod";

export const expirationTypeEnum = z.enum(["none", "date", "gradual", "both"]);
const noExpirySchema = z.object({
  type: z.literal(expirationTypeEnum.enum.none),
});
const dateExpirySchema = z.object({
  type: z.literal(expirationTypeEnum.enum.date),
  expirationDate: z.date(),
});
const gradualExpirySchema = z.object({
  type: z.literal(expirationTypeEnum.enum.gradual),
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
const bothExpirySchema = z.object({
  type: z.literal(expirationTypeEnum.enum.both),
  expirationDate: z.date(),
  rate: z.coerce
    .number()
    .positive("Demurrage Rate must be positive")
    .max(100, "Demurrage Rate must be less than 100")
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
  bothExpirySchema,
]);

export type ExpirationFormValues = z.infer<typeof expirationSchema>;
