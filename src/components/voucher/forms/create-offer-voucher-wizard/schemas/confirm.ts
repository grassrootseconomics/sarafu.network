import { z } from "zod";

export const confirmSchema = z.object({
  termsAndConditions: z.boolean().refine((v) => v === true, {
    message: "You must accept the terms and conditions",
  }),
  pathLicense: z.boolean().refine((v) => v === true, {
    message: "You must accept the PATH license",
  }),
});

export type ConfirmFormValues = z.infer<typeof confirmSchema>;
