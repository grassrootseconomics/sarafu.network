import { Button } from "~/components/ui/button";
import { steps } from ".";
import { useVoucherStepper } from "./provider";

interface StepControlsProps {
  onNext?: () => Promise<void> | void;
  onPrev?: () => void;
}

export function StepControls({ onNext, onPrev }: StepControlsProps) {
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
  };
  const handlePrevButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrev) {
      void onPrev();
    } else {
      prevStep();
    }
  };
  return (
    <div className="flex items-center justify-end gap-2">
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
            onClick={handlePrevButtonClick}
          >
            Prev
          </Button>
          <Button type="button" onClick={handleNextButtonClick}>
            {isLastStep ? "Finish" : isOptionalStep ? "Skip" : "Next"}
          </Button>
        </>
      )}
    </div>
  );
}