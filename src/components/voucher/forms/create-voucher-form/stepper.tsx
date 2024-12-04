"use client";
import React, { type ReactElement } from "react";
import { type ZodSchema } from "zod";
import { useVoucherStepper } from "./provider";

interface Step {
  label: string;
  children: ReactElement;
  schema?: ZodSchema;
  icon: ReactElement;
}

interface StepperProps {
  steps: Step[];
  initialStep?: number;
  onComplete?: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ steps }) => {
  const { activeStep } = useVoucherStepper();
  return (
    <div>
      <div className="sticky top-0 flex flex-col bg-white  z-10">
        <div className="mt-2 flex items-center justify-center">
          {steps[activeStep]?.icon}
          <span className="ml-2 text-center">{steps[activeStep]?.label}</span>
        </div>
        <div className="relative h-1 rounded w-full py-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`absolute left-0 h-1  rounded ${
                index === activeStep
                  ? "bg-gradient-to-r from-green-500 via-gray-300 to-gray-300"
                  : index <= activeStep
                    ? "bg-green-500"
                    : "bg-gray-300"
              } ${index < steps.length - 1 ? "mr-1" : ""}`}
              style={{
                width: `calc(${100 / steps.length}% - 0.25rem)`,
                left: `${(index * 100) / steps.length}%`,
              }}
            ></div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <div className="mt-6">{steps[activeStep]?.children}</div>
      </div>
    </div>
  );
};

export default Stepper;
