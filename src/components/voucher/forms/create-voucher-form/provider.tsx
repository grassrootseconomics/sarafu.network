import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { useRouter } from "next/router";
import { BaseError } from "wagmi";
import { z } from "zod";
import {
  useStepper,
  type Steps,
  type UseStepperReturn,
} from "~/components/ui/use-stepper";
import { useToast } from "~/components/ui/use-toast";
import { useDeploy } from "~/hooks/useDeploy";
import { schemas, type VoucherPublishingSchema } from "./schemas";
import { base64ToObject, objectToBase64 } from "./utils";

type CreateVoucherContextType = {
  state: Partial<VoucherPublishingSchema>;
  setState: Dispatch<SetStateAction<Partial<VoucherPublishingSchema>>>;
  stepper: UseStepperReturn;
};

const CreateVoucherContext = createContext<CreateVoucherContextType>({
  state: {},
  setState: () => {},
  stepper: {} as UseStepperReturn,
});

export const CreateVoucherProvider = ({
  children,
  steps,
}: {
  children: React.ReactNode;
  steps: Steps;
}) => {
  const [state, setState] = useState<Partial<VoucherPublishingSchema>>({});
  const router = useRouter();
  const query = router.query;
  useEffect(() => {
    if (query?.data) {
      const decoded = base64ToObject(
        query.data as string
      ) as Partial<VoucherPublishingSchema>;
      if (decoded) {
        if (
          decoded.expiration &&
          (decoded.expiration.type === "date" ||
            decoded.expiration.type === "both") &&
          decoded.expiration?.expirationDate
        ) {
          decoded.expiration.expirationDate = new Date(
            decoded.expiration.expirationDate
          );
        }
        setState(decoded);
        stepper.setStep(Number(query.step) || 0);
      }
    }
  }, [query?.data, query?.step]);

  const stepper = useStepper({
    initialStep: 0,
    steps,
  });
  useEffect(() => {
    if (state && Object.keys(state).length > 0) {
      const encoded = objectToBase64(state);
      void router.push(
        `/publish?data=${encoded}&step=${stepper.activeStep}`,
        undefined,
        {
          shallow: true,
        }
      );
    }
  }, [state, stepper.activeStep]);
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
  if (context === undefined) {
    throw new Error("useUser must be used within an CreateVoucherContext");
  }

  return context.state;
}
export function useVoucherForm<T extends keyof VoucherPublishingSchema>(
  step: T
) {
  const context = useContext(CreateVoucherContext);
  if (context === undefined) {
    throw new Error(
      "useVoucherForm must be used within an CreateVoucherContext"
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
export function useVoucherDeploy() {
  const context = useContext(CreateVoucherContext);
  const toast = useToast();
  const showError = useCallback(
    (message: string) => {
      toast.toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
    [toast]
  );
  const { deploy, ...other } = useDeploy();

  if (context === undefined) {
    throw new Error(
      "useVoucherForm must be used within an CreateVoucherContext"
    );
  }
  const onValid = async (
    data: VoucherPublishingSchema["signingAndPublishing"]
  ) => {
    const formData = { ...context.state, ["signingAndPublishing"]: data };
    const result = await z.object(schemas).safeParseAsync(formData);
    context.setState(formData);
    if (result.success) {
      try {
        await deploy(result.data);
      } catch (error) {
        console.error(error);
        const message =
          error instanceof BaseError
            ? error.shortMessage
            : error instanceof Error
            ? error.message
            : "Something went wrong";
        showError(message);
      }
    }
    if (!result.success) {
      console.error(result.error);
    }
  };

  return { onValid, ...other };
}
export function useVoucherStepper() {
  const context = useContext(CreateVoucherContext);

  if (context === undefined) {
    throw new Error(
      "useVoucherStepper must be used within an CreateVoucherContext"
    );
  }

  return context.stepper;
}
