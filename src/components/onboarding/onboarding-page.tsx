"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { SkipForward, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useStepper } from "~/components/ui/use-stepper";
import {
  OfferVoucherProvider,
  useOfferVoucherDeploy,
} from "~/components/voucher/forms/create-offer-voucher-wizard/provider";
import { Step1Offer } from "~/components/voucher/forms/create-offer-voucher-wizard/steps/step-1-offer";
import { Step2Pricing } from "~/components/voucher/forms/create-offer-voucher-wizard/steps/step-2-pricing";
import { Step3Voucher } from "~/components/voucher/forms/create-offer-voucher-wizard/steps/step-3-voucher";
import { Step4Confirm } from "~/components/voucher/forms/create-offer-voucher-wizard/steps/step-4-confirm";
import { SuccessScreen } from "~/components/voucher/forms/create-offer-voucher-wizard/success-screen";
import { useAuth } from "~/hooks/useAuth";
import { ProfileStep } from "./steps/profile-step";

const steps = [
  { label: "Profile" },
  { label: "Create Offer" },
  { label: "Price Offer" },
  { label: "Your Voucher" },
  { label: "Confirm" },
];

export function OnboardingPage({ defaultCurrency }: { defaultCurrency?: string }) {
  const auth = useAuth();
  const router = useRouter();
  const { openConnectModal } = useConnectModal();
  const [flowActive, setFlowActive] = useState(false);

  const { activeStep, nextStep, prevStep, setStep } = useStepper({
    initialStep: 0,
    steps,
  });

  // If already onboarded, redirect to wallet
  useEffect(() => {
    if (auth?.session?.user?.onboarding_completed && !flowActive) {
      router.push("/wallet");
    }
  }, [auth?.session?.user?.onboarding_completed, router, flowActive]);

  // Not connected — show connect wallet prompt
  if (!auth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Wallet className="size-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Welcome to Sarafu Network
          </h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Connect your wallet to get started with community asset vouchers.
          </p>
          <Button
            size="lg"
            onClick={openConnectModal}
            className="min-w-[200px]"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  // Already onboarded — show nothing while redirecting
  if (auth.session?.user?.onboarding_completed && !flowActive) {
    return null;
  }

  const handleSkip = () => {
    router.push("/wallet");
  };

  // Wizard steps (1-4) are inside OfferVoucherProvider
  const isWizardStep = activeStep >= 1;

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-4 py-12">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-12">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full transition-colors ${
                index <= activeStep
                  ? "bg-primary"
                  : "bg-muted-foreground/30"
              }`}
            />
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 transition-colors ${
                  index < activeStep
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {activeStep === 0 && (
        <ProfileStep
          existingUser={auth.user}
          onComplete={() => {
            setFlowActive(true);
            nextStep();
          }}
        />
      )}

      {isWizardStep && (
        <OfferVoucherProvider defaultCurrency={defaultCurrency}>
          <OnboardingWizardSteps
            activeStep={activeStep}
            nextStep={nextStep}
            prevStep={prevStep}
            setStep={setStep}
            onSkip={handleSkip}
          />
        </OfferVoucherProvider>
      )}
    </div>
  );
}

function OnboardingWizardSteps({
  activeStep,
  nextStep,
  prevStep,
  setStep,
  onSkip,
}: {
  activeStep: number;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  onSkip: () => void;
}) {
  const { deployResult, clearDraft } = useOfferVoucherDeploy();

  if (deployResult) {
    return <SuccessScreen result={deployResult} onClearDraft={clearDraft} />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {activeStep === 1 && (
        <Step1Offer onComplete={nextStep} onBack={prevStep} />
      )}
      {activeStep === 2 && (
        <Step2Pricing onComplete={nextStep} onBack={prevStep} />
      )}
      {activeStep === 3 && (
        <Step3Voucher onComplete={nextStep} onBack={prevStep} />
      )}
      {activeStep === 4 && (
        <Step4Confirm
          onBack={prevStep}
          setStep={(wizardStep) => setStep(wizardStep + 1)}
        />
      )}

      {/* Skip option */}
      {activeStep >= 1 && activeStep <= 4 && !deployResult && (
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={onSkip}
          >
            <SkipForward className="mr-2 size-4" />
            Skip for now
          </Button>
        </div>
      )}
    </div>
  );
}
