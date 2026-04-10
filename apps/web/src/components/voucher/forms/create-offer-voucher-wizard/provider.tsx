"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { type OfferVoucherWizardData } from "./schemas";

export type DeployResult = {
  address: `0x${string}`;
  txHash?: `0x${string}`;
  voucherName: string;
  offerName: string;
  currency: string;
};

type OfferVoucherContextType = {
  state: Partial<OfferVoucherWizardData>;
  setState: (
    value:
      | Partial<OfferVoucherWizardData>
      | ((
          v: Partial<OfferVoucherWizardData>
        ) => Partial<OfferVoucherWizardData>)
  ) => void;
  deployResult: DeployResult | null;
  setDeployResult: (result: DeployResult | null) => void;
  clearDraft: () => void;
  defaultCurrency: string;
};

const OfferVoucherContext = createContext<OfferVoucherContextType | undefined>(
  undefined
);

export function OfferVoucherProvider({
  children,
  defaultCurrency = "USD",
}: {
  children: React.ReactNode;
  defaultCurrency?: string;
}) {
  const [state, setState] = useLocalStorage<Partial<OfferVoucherWizardData>>(
    "offer-voucher-creation-data",
    {}
  );
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);

  const clearDraft = useCallback(() => {
    setState({});
  }, [setState]);

  const contextValue = useMemo(
    () => ({ state, setState, deployResult, setDeployResult, clearDraft, defaultCurrency }),
    [state, setState, deployResult, clearDraft, defaultCurrency]
  );

  return (
    <OfferVoucherContext.Provider value={contextValue}>
      {children}
    </OfferVoucherContext.Provider>
  );
}

export function useOfferVoucherData() {
  const context = useContext(OfferVoucherContext);
  if (!context) {
    throw new Error(
      "useOfferVoucherData must be used within OfferVoucherProvider"
    );
  }
  return context.state;
}

export function useOfferVoucherForm<T extends keyof OfferVoucherWizardData>(
  step: T
) {
  const context = useContext(OfferVoucherContext);
  if (!context) {
    throw new Error(
      "useOfferVoucherForm must be used within OfferVoucherProvider"
    );
  }

  const values = context.state[step];
  const onValid = (
    data: OfferVoucherWizardData[T],
    onComplete?: () => void
  ) => {
    context.setState((prev) => ({ ...prev, [step]: data }));
    onComplete?.();
  };

  return { values, onValid, defaultCurrency: context.defaultCurrency };
}

export function useOfferVoucherDeploy() {
  const context = useContext(OfferVoucherContext);
  if (!context) {
    throw new Error(
      "useOfferVoucherDeploy must be used within OfferVoucherProvider"
    );
  }
  return {
    state: context.state,
    deployResult: context.deployResult,
    setDeployResult: context.setDeployResult,
    clearDraft: context.clearDraft,
  };
}
