import { z } from "zod";
import { consentFields } from "@sarafu/schemas/voucher";

export const confirmSchema = z.object(consentFields);

export type ConfirmFormValues = z.infer<typeof confirmSchema>;
