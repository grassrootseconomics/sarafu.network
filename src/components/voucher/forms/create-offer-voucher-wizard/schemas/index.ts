import { type z } from "zod";
import { type confirmSchema } from "./confirm";
import { type offerSchema } from "./offer";
import { type pricingSchema } from "./pricing";
import { type voucherStepSchema } from "./voucher";

export type OfferVoucherWizardData = {
  offer: z.infer<typeof offerSchema>;
  pricing: z.infer<typeof pricingSchema>;
  voucher: z.infer<typeof voucherStepSchema>;
  confirm: z.infer<typeof confirmSchema>;
};
