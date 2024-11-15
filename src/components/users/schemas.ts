import { z } from "zod";
import { AccountRoleType } from "~/server/enums";

const VPA_PATTERN = /^[a-zA-Z0-9]+@[a-zA-Z]+$/;

export const UserProfileFormSchema = z.object({
  vpa: z
    .string()
    .toLowerCase()
    .trim()
    .optional()
    .refine((v) => {
      if (!v) return true;
      return VPA_PATTERN.test(v);
    }, "Invalid VPA format"),
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
