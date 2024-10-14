"use client";
import { createContext, useContext, useMemo } from "react";

import {
  useStepper,
  type Steps,
  type UseStepperReturn,
} from "~/components/ui/use-stepper";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { type VoucherPublishingSchema } from "./schemas";

type CreateVoucherContextType = {
  state: Partial<VoucherPublishingSchema>;
  setState: (
    value:
      | Partial<VoucherPublishingSchema>
      | ((
          v: Partial<VoucherPublishingSchema>
        ) => Partial<VoucherPublishingSchema>)
  ) => void;
  stepper: UseStepperReturn;
};

const CreateVoucherContext = createContext<
  CreateVoucherContextType | undefined
>(undefined);

export const CreateVoucherProvider = ({
  children,
  steps,
}: {
  children: React.ReactNode;
  steps: Steps;
}) => {
  const [state, setState] = useLocalStorage<Partial<VoucherPublishingSchema>>(
    "voucher-creation-data",
    {}
  );
  const stepper = useStepper({
    initialStep: 0,
    steps,
  });

  const contextValue = useMemo(
    () => ({ state, setState, stepper }),
    [state, stepper]
  );

  return (
    <CreateVoucherContext.Provider value={contextValue}>
      {children}
    </CreateVoucherContext.Provider>
  );
};

export function useVoucherData() {
  const context = useContext(CreateVoucherContext);
  if (!context) {
    throw new Error(
      "useVoucherData must be used within a CreateVoucherProvider"
    );
  }
  return context.state;
}

export function useVoucherForm<T extends keyof VoucherPublishingSchema>(
  step: T
) {
  const context = useContext(CreateVoucherContext);
  if (!context) {
    throw new Error(
      "useVoucherForm must be used within a CreateVoucherProvider"
    );
  }

  const values = context.state[step];
  const onValid = (data: VoucherPublishingSchema[T]) => {
    context.setState((state) => ({ ...state, [step]: data }));
    if (step === "signingAndPublishing") {
      console.debug(context.state);
    } else {
      context.stepper.nextStep();
    }
  };

  return { values, onValid };
}

export function useVoucherStepper() {
  const context = useContext(CreateVoucherContext);

  if (!context) {
    throw new Error(
      "useVoucherStepper must be used within a CreateVoucherProvider"
    );
  }

  return context.stepper;
}
