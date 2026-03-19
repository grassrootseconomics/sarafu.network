"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useStepper } from "~/components/ui/use-stepper";
import { useAuth } from "~/hooks/useAuth";
import { ProfileStep } from "./steps/profile-step";
import { WelcomeStep } from "./steps/welcome-step";

const steps = [
  { label: "Create Account" },
  { label: "Welcome" },
];

export function OnboardingPage() {
  const auth = useAuth();
  const router = useRouter();
  const { openConnectModal } = useConnectModal();
  const [givenNames, setGivenNames] = useState("");

  const { activeStep, nextStep } = useStepper({
    initialStep: 0,
    steps,
  });

  // If already onboarded, redirect to wallet
  useEffect(() => {
    if (auth?.session?.user?.onboarding_completed) {
      router.push("/wallet");
    }
  }, [auth?.session?.user?.onboarding_completed, router]);

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
          <Button size="lg" onClick={openConnectModal} className="min-w-[200px]">
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  // Already onboarded — show nothing while redirecting
  if (auth.session?.user?.onboarding_completed) {
    return null;
  }

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
          onComplete={(data) => {
            setGivenNames(data.given_names);
            nextStep();
          }}
        />
      )}
      {activeStep === 1 && <WelcomeStep givenNames={givenNames} />}
    </div>
  );
}
