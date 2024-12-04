"use client";
import { Button } from "~/components/ui/button";
import { steps } from ".";
import { useVoucherStepper } from "./provider";
import { ArrowLeft, ArrowRight, Send } from "lucide-react"

interface StepControlsProps {
  onNext?: () => Promise<void> | void;
  onPrev?: () => void;
  disabled?: boolean;
}

export function StepControls({ onNext, onPrev, disabled }: StepControlsProps) {
  const {
    nextStep,
    prevStep,
    activeStep,
    resetSteps,
    isDisabledStep,
    isLastStep,
    isOptionalStep,
  } = useVoucherStepper();

  const handleNextButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNext) {
      void onNext();
    } else {
      nextStep();
    }
    window.scrollTo(0, 0);
  };
  const handlePrevButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrev) {
      void onPrev();
    } else {
      prevStep();
    }
    window.scrollTo(0, 0);
  };
  return (
    <div className="flex items-center justify-end gap-2 pb-6">
      {activeStep === steps.length ? (
        <>
          <h2>All steps completed!</h2>
          <Button onClick={resetSteps}>Reset</Button>
        </>
      ) : (
        <>
          <Button
            disabled={isDisabledStep}
            type="button"
            variant="outline"
            onClick={handlePrevButtonClick}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Prev
          </Button>
          <Button type="button" onClick={handleNextButtonClick} disabled={disabled}>
            {isLastStep ? (
              <>
                <Send className="mr-2 h-4 w-4" />
                Publish
              </>
            ) : isOptionalStep ? (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Skip
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Next
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
