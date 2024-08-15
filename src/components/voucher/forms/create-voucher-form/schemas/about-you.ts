import { z } from "zod";

export const aboutYouType = z.enum(["group", "personal"]);

const validUrl = z.string().url().optional();
export const personalSchema = z.object({
  type: z.literal(aboutYouType.enum.personal),
  name: z
    .string()
    .trim()
    .min(2, {
      message: "Your name must be at least 2 characters.",
    })
    .max(30, {
      message: "Your name must not be longer than 30 characters.",
    }),
  email: z
    .string({
      required_error: "Email is required.",
    })
    .email(),
  website: validUrl,
  geo: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
  location: z.string().max(64).optional(),
});
const groupSchema = z.object({
  type: z.literal(aboutYouType.enum.group),
  name: z
    .string({
      required_error: "Organization Name is required.",
    })
    .trim()

    .min(2, {
      message: "Organization Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Organization Name must not be longer than 30 characters.",
    }),

  email: z
    .string({
      required_error: "Email is required.",
    })
    .email(),
  website: validUrl,
  authorized: z.literal("yes", {
    required_error: "You must be authorized",
    invalid_type_error: "You must be authorized",
  }),
  geo: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
  location: z.string().max(64).optional(),
});
export const aboutYouSchema = z.discriminatedUnion("type", [
  personalSchema,
  groupSchema,
]);
export type AboutYouFormValues = z.infer<typeof aboutYouSchema>;
