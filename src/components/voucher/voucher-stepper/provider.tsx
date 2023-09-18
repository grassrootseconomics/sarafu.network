import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { useRouter } from "next/router";
import { z } from "zod";
import {
  useStepper,
  type Steps,
  type UseStepperReturn,
} from "~/components/ui/use-stepper";
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
      }
    }
  }, [query?.data]);
  useEffect(() => {
    if (state && Object.keys(state).length > 0) {
      const encoded = objectToBase64(state);
      void router.push(`/publish?data=${encoded}`);
    }
  }, [state]);
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
      console.log(context.state);
    } else {
      context.stepper.nextStep();
    }
  };

  return { values, onValid };
}
export function useVoucherDeploy() {
  const context = useContext(CreateVoucherContext);
  const { deploy, ...other } = useDeploy();

  if (context === undefined) {
    throw new Error(
      "useVoucherForm must be used within an CreateVoucherContext"
    );
  }
  const onValid = async (
    data: VoucherPublishingSchema["signingAndPublishing"]
  ) => {
    context.setState((state) => ({ ...state, ["signingAndPublishing"]: data }));
    const result = await z.object(schemas).safeParseAsync(context.state);
    if (result.success) {
      await deploy(result.data);
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
