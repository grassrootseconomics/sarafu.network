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
import { type z } from "zod";
import {
  useStepper,
  type Steps,
  type UseStepperReturn,
} from "~/components/ui/use-stepper";
import { aboutYouSchema } from "./steps/about-you";
import { expirationSchema } from "./steps/expiration";
import { nameAndProductsSchema } from "./steps/name-and-products";
import { optionsSchema } from "./steps/options";
import { valueAndSupplySchema } from "./steps/value-and-supply";
import { base64ToObject } from "./utils";

const schemas = {
  aboutYou: aboutYouSchema,
  expiration: expirationSchema,
  nameAndProducts: nameAndProductsSchema,
  valueAndSupply: valueAndSupplySchema,
  options: optionsSchema,
};

export type FormSchemaType = {
  [key in keyof typeof schemas]: z.infer<(typeof schemas)[key]>;
};

type CreateVoucherContextType = {
  state: Partial<FormSchemaType>;
  setState: Dispatch<SetStateAction<Partial<FormSchemaType>>>;
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
  const [state, setState] = useState<Partial<FormSchemaType>>({});
  const router = useRouter();
  const query = router.query;
  useEffect(() => {
    if (query?.data) {
      const decoded = base64ToObject(
        query.data as string
      ) as Partial<FormSchemaType>;
      if (decoded) {
        console.log(decoded);
        if (decoded.expiration?.expirationData) {
          decoded.expiration.expirationData = new Date(
            decoded.expiration.expirationData
          );
        }
        setState(decoded);
      }
    }
  }, [query?.data]);
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
export function useVoucherForm<T extends keyof FormSchemaType>(step: T) {
  const context = useContext(CreateVoucherContext);
  if (context === undefined) {
    throw new Error("useVoucherForm must be used within an CreateVoucherContext");
  }
  const values = context.state[step];
  const onValid = (data: FormSchemaType[T]) => {
    console.log(data);
    context.setState((state) => ({ ...state, [step]: data }));
    context.stepper.nextStep();
  };

  return { values, onValid };
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
