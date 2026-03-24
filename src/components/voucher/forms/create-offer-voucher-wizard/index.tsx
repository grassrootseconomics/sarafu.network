"use client";

import { useStepper } from "~/components/ui/use-stepper";
import {
  OfferVoucherProvider,
  useOfferVoucherDeploy,
} from "./provider";
import { Step1Offer } from "./steps/step-1-offer";
import { Step2Pricing } from "./steps/step-2-pricing";
import { Step3Voucher } from "./steps/step-3-voucher";
import { Step4Confirm } from "./steps/step-4-confirm";
import { SuccessScreen } from "./success-screen";

const wizardSteps = [
  { label: "Create Your Offer" },
  { label: "Price Your Offer" },
  { label: "Your Voucher" },
  { label: "Confirm & Publish" },
];

function WizardContent() {
  const { activeStep, nextStep, prevStep } = useStepper({
    initialStep: 0,
    steps: wizardSteps,
  });
  const { deployResult, clearDraft } = useOfferVoucherDeploy();

  if (deployResult) {
    return <SuccessScreen result={deployResult} onClearDraft={clearDraft} />;
  }

  return (
    <div className="flex w-full max-w-2xl mx-auto flex-col gap-4">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-background pt-4 pb-2">
        <p className="text-sm text-muted-foreground text-center mb-2">
          Step {activeStep + 1} of {wizardSteps.length}:{" "}
          <span className="font-medium text-foreground">
            {wizardSteps[activeStep]?.label}
          </span>
        </p>
        <div className="flex gap-1">
          {wizardSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index <= activeStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      {activeStep === 0 && (
        <Step1Offer onComplete={() => nextStep()} />
      )}
      {activeStep === 1 && (
        <Step2Pricing onComplete={() => nextStep()} onBack={prevStep} />
      )}
      {activeStep === 2 && (
        <Step3Voucher onComplete={() => nextStep()} onBack={prevStep} />
      )}
      {activeStep === 3 && <Step4Confirm onBack={prevStep} />}
    </div>
  );
}

export default function CreateOfferVoucherWizard() {
  return (
    <OfferVoucherProvider>
      <WizardContent />
    </OfferVoucherProvider>
  );
}
