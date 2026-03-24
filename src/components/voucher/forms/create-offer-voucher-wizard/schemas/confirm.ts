import { z } from "zod";
import { consentFields } from "~/server/api/schemas/shared-fields";

export const confirmSchema = z.object(consentFields);

export type ConfirmFormValues = z.infer<typeof confirmSchema>;
