"use client";

import {
  NfcIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  WalletIcon,
} from "lucide-react";
import { Label } from "~/components/ui/label";

import { WalletCreationStep } from "./wallet-creation-types";

interface StepConfig {
  key: WalletCreationStep;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEP_CONFIG: StepConfig[] = [
  { key: "generating", label: "Generate", icon: UserPlusIcon },
  { key: "registering", label: "Register", icon: ShieldCheckIcon },
  { key: "writing", label: "Write NFC", icon: NfcIcon },
  { key: "completed", label: "Complete", icon: WalletIcon },
];

interface WalletCreationStepsProps {
  currentStep: WalletCreationStep;
  walletType?: string; // For backward compatibility
}

export function WalletCreationSteps({
  currentStep,
  walletType,
}: WalletCreationStepsProps) {
  const getStepStatus = (step: WalletCreationStep) => {
    // For paper wallets, skip the writing step
    const steps: WalletCreationStep[] = walletType?.startsWith("paper")
      ? ["generating", "registering", "completed"]
      : ["generating", "registering", "writing", "completed"];

    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  // Filter steps based on wallet type
  const visibleSteps = walletType?.startsWith("paper")
    ? STEP_CONFIG.filter((step) => step.key !== "writing")
    : STEP_CONFIG;

  return (
    <div className="flex items-center justify-between mb-6">
      {visibleSteps.map(({ key, label, icon: Icon }, index) => {
        const status = getStepStatus(key);
        return (
          <div key={key} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                status === "completed"
                  ? "bg-green-500 border-green-500 text-white"
                  : status === "active"
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-gray-100 border-gray-300 text-gray-500"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <Label className="text-xs mt-1">{label}</Label>
            {index < visibleSteps.length - 1 && (
              <div
                className={`w-16 h-px mt-2 ${
                  getStepStatus(visibleSteps[index + 1]?.key || "completed") !==
                  "pending"
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
