import { z } from "zod";
import { AccountRoleType } from "~/server/enums";

export const UserProfileFormSchema = z.object({
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
  email: z.string().email().nullable().optional(),
  date_of_birth: z.coerce.string().nullable().optional(),
  bio: z.string().trim().nullable().optional(),
  profile_photo_url: z.string().url().nullable().optional(),
});

export const OnboardingProfileFormSchema = z.object({
  given_names: z.string().trim().min(1, "Name is required"),
  family_name: z.string().trim().min(1, "Family name is required"),
  email: z.string().email("Invalid email address"),
  date_of_birth: z.coerce
    .date({ required_error: "Date of birth is required" })
    .refine((d) => d <= new Date(), { message: "Date of birth cannot be in the future" })
    .refine((d) => d.getFullYear() >= 1900, { message: "Please enter a valid birth year" }),
  location_name: z.string().trim().min(1, "Location is required"),
  geo: z.object({ x: z.number(), y: z.number() }).nullable(),
  bio: z.string().trim().nullable().optional(),
  profile_photo_url: z.string().url().nullable().optional(),
});

export const UserRoleFormSchema = z.object({
  role: z.nativeEnum(AccountRoleType).nullable(),
});
