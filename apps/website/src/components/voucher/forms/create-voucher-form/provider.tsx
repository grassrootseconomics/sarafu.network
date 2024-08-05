"use client";
import { createContext, useContext, useMemo } from "react";

import { toast } from "sonner";
import { z } from "zod";
import {
  useStepper,
  type Steps,
  type UseStepperReturn,
} from "~/components/ui/use-stepper";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { useVoucherDeploy as useDeploy } from "~/hooks/useVoucherDeploy";
import { createVoucherSchemas, type CreateVoucherSchema } from "@grassroots/validators/vouchers/create";

type CreateVoucherContextType = {
  state: Partial<CreateVoucherSchema>;
  setState: (
    value:
      | Partial<CreateVoucherSchema>
      | ((
          v: Partial<CreateVoucherSchema>
        ) => Partial<CreateVoucherSchema>)
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
  const [state, setState] = useLocalStorage<Partial<CreateVoucherSchema>>(
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

export function useVoucherForm<T extends keyof CreateVoucherSchema>(
  step: T
) {
  const context = useContext(CreateVoucherContext);
  if (!context) {
    throw new Error(
      "useVoucherForm must be used within a CreateVoucherProvider"
    );
  }

  const values = context.state[step];
  const onValid = (data: CreateVoucherSchema[T]) => {
    context.setState((state) => ({ ...state, [step]: data }));
    if (step === "signingAndPublishing") {
      console.debug(context.state);
    } else {
      context.stepper.nextStep();
    }
  };

  return { values, onValid };
}

export function useVoucherDeploy() {
  const context = useContext(CreateVoucherContext);
  const { deploy, ...other } = useDeploy();

  if (!context) {
    throw new Error(
      "useVoucherDeploy must be used within a CreateVoucherProvider"
    );
  }

  const onValid = async (
    data: CreateVoucherSchema["signingAndPublishing"]
  ) => {
    const formData = { ...context.state, signingAndPublishing: data };
    const validation = await z.object(createVoucherSchemas).safeParseAsync(formData);
    context.setState(formData);
    if (!validation.success) {
      toast.error(`Validation failed: ${validation.error.message}`);
      console.error(validation.error);
      return;
    }
    try {
      await deploy(validation.data);
      context.setState({});
    } catch (error) {
      let message = "Something went wrong";
      if (error && typeof error === "object") {
        message =
          "shortMessage" in error
            ? (error.shortMessage as string)
            : "message" in error
              ? (error.message as string)
              : message;
      }
      toast.error(message);
    }
  };

  return { onValid, ...other };
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
