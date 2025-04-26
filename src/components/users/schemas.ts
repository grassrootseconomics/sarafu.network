import { z } from "zod";
import { AccountRoleType } from "~/server/enums";

export const UserProfileFormSchema = z.object({
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
