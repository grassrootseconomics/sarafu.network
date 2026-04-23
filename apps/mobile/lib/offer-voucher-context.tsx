import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "offer-voucher-creation-data";

interface OfferData {
  name: string;
  description: string;
  categories: string[];
}

interface PricingData {
  currency: string;
  price: number;
  unit: string;
  quantity: number;
  frequency: "day" | "week" | "month" | "year";
}

interface VoucherData {
  name: string;
  shopDescription: string;
  value: number;
  uoa: string;
  symbol: string;
  supply: number;
  contactEmail: string;
  location: string;
  voucherType: "GIFTABLE" | "GIFTABLE_EXPIRING" | "DEMURRAGE";
}

export interface DeployResult {
  address: string;
  txHash?: string;
  voucherName: string;
  offerName: string;
  currency: string;
}

interface WizardState {
  offer?: Partial<OfferData>;
  pricing?: Partial<PricingData>;
  voucher?: Partial<VoucherData>;
}

interface OfferVoucherContextValue {
  state: WizardState;
  setOffer: (data: OfferData) => void;
  setPricing: (data: PricingData) => void;
  setVoucher: (data: VoucherData) => void;
  deployResult: DeployResult | null;
  setDeployResult: (result: DeployResult) => void;
  clearDraft: () => void;
}

const OfferVoucherContext = createContext<OfferVoucherContextValue | null>(null);

export function OfferVoucherProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>({});
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load persisted draft on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setState(JSON.parse(raw));
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  // Persist draft on change
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, loaded]);

  const setOffer = useCallback((data: OfferData) => {
    setState((s) => ({ ...s, offer: data }));
  }, []);

  const setPricing = useCallback((data: PricingData) => {
    setState((s) => ({ ...s, pricing: data }));
  }, []);

  const setVoucher = useCallback((data: VoucherData) => {
    setState((s) => ({ ...s, voucher: data }));
  }, []);

  const clearDraft = useCallback(() => {
    setState({});
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <OfferVoucherContext.Provider
      value={{
        state,
        setOffer,
        setPricing,
        setVoucher,
        deployResult,
        setDeployResult,
        clearDraft,
      }}
    >
      {children}
    </OfferVoucherContext.Provider>
  );
}

export function useOfferVoucher() {
  const ctx = useContext(OfferVoucherContext);
  if (!ctx)
    throw new Error(
      "useOfferVoucher must be used within OfferVoucherProvider"
    );
  return ctx;
}
