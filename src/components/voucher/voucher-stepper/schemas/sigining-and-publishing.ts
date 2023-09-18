import { z } from "zod";
export const signingAndPublishingSchema = z.object({
  pathLicense: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and conditions",
  }),
  termsAndConditions: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type SigningAndPublishingFormValues = z.infer<typeof signingAndPublishingSchema>;
