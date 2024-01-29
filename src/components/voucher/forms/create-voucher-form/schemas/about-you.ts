import { z } from "zod";

export const aboutYouType = z.enum(["group", "personal"]);

const urlPattern =
  /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g;
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
  website: z
    .string()
    .transform((val) => {
      let v = val.trim();
      if (!v.startsWith("http://") && !v.startsWith("https://")) {
        v = `https://${v}`; // Prepend http:// if not present
      }
      return v;
    })
    .refine(
      (val) => {
        return urlPattern.test(val);
      },
      {
        message: "Invalid URL",
      }
    )
    .optional(),
  geo: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .required(),
  location: z.string().nonempty("Location is required"),
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
  website: z.string().url().optional(),
  authorized: z.literal("yes", {
    required_error: "You must be authorized",
    invalid_type_error: "You must be authorized",
  }),
  geo: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .required(),
  location: z.string().trim().nonempty("Location is required"),
});
export const aboutYouSchema = z.discriminatedUnion("type", [
  personalSchema,
  groupSchema,
]);
export type AboutYouFormValues = z.infer<typeof aboutYouSchema>;
