import { z } from "zod";
import { AccountRoleType } from "~/server/enums";

export const UserProfileFormSchema = z.object({
  vpa: z
    .string()
    .toLowerCase()
    .trim()
    .min(1, "Shortcode is required")
    .max(20, "Shortcode must be less than 20 characters")
    .optional(),
  year_of_birth: z.coerce.number().nullable(),
  family_name: z.string().trim().nullable(),
  given_names: z.string().trim().nullable(),
  location_name: z.string().trim().nullable(),
  default_voucher: z.string().nullable(),
  role: z.nativeEnum(AccountRoleType).nullable(),
  geo: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .nullable(),
});
