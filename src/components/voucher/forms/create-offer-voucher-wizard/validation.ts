import { type OfferVoucherWizardData } from "./schemas";
import { offerSchema } from "./schemas/offer";
import { pricingSchema } from "./schemas/pricing";
import { voucherStepSchemaSync } from "./schemas/voucher";

export type StepValidationResult = {
  step: number;
  label: string;
  isValid: boolean;
  errors: string[];
};

const stepConfigs = [
  { key: "offer" as const, label: "Create Your Offer", schema: offerSchema },
  { key: "pricing" as const, label: "Price Your Offer", schema: pricingSchema },
  {
    key: "voucher" as const,
    label: "Your Voucher",
    schema: voucherStepSchemaSync,
  },
] as const;

export function validateWizardSteps(
  data: Partial<OfferVoucherWizardData>
): StepValidationResult[] {
  return stepConfigs.map(({ key, label, schema }, index) => {
    const stepData = data[key];
    if (!stepData) {
      return {
        step: index,
        label,
        isValid: false,
        errors: ["This step has not been completed yet"],
      };
    }

    const result = schema.safeParse(stepData);
    if (result.success) {
      return { step: index, label, isValid: true, errors: [] };
    }

    const errors = result.error.issues.map((issue) => issue.message);
    return { step: index, label, isValid: false, errors };
  });
}

export function getFirstIncompleteStep(
  data: Partial<OfferVoucherWizardData>
): number | null {
  const results = validateWizardSteps(data);
  const firstInvalid = results.find((r) => !r.isValid);
  return firstInvalid ? firstInvalid.step : null;
}
