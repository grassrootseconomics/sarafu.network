import { z } from "zod";

const VPA_PATTERN = /^[a-zA-Z0-9]+@[a-zA-Z]+$/;

export const updateUserProfileInput = z.object({
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
  geo: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .nullable(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileInput>;