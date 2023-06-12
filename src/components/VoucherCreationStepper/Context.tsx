import { ReactNode, createContext, useContext, useState } from "react";
import { z } from "zod";

// Define TypeScript type
type VoucherData = {
  issuer: string;
  name: string;
  symbol: string;
  products: string;
  value: string;
  supply: string;
  expiration: string;
  options: string;
};

// Define Zod schema
const voucherSchema = z.object({
  issuer: z.string().nonempty({ message: "Issuer is required" }),
  name: z.string().nonempty({ message: "Name is required" }),
  symbol: z.string().nonempty({ message: "Symbol is required" }),
  products: z.string().nonempty({ message: "Products are required" }),
  value: z.string().nonempty({ message: "Value is required" }),
  supply: z.string().nonempty({ message: "Supply is required" }),
  expiration: z.string().nonempty({ message: "Expiration date is required" }),
  options: z.string(),
});

// Initial state
const initialState: VoucherData = {
  issuer: "",
  name: "",
  symbol: "",
  products: "",
  value: "",
  supply: "",
  expiration: "",
  options: "",
};

// Define context type
type VoucherCreationContextType = {
  voucherData: VoucherData;
  updateVoucherData: (field: keyof VoucherData, value: string) => void;
};

// Create context
const VoucherCreationContext = createContext<
  VoucherCreationContextType | undefined
>(undefined);

// Provider component
export const VoucherCreationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [voucherData, setVoucherData] = useState<VoucherData>(initialState);

  const updateVoucherData = (field: keyof VoucherData, value: string) => {
    // validate the new value with Zod
    setVoucherData((prevState) => ({ ...prevState, [field]: value }));
  };

  return (
    <VoucherCreationContext.Provider value={{ voucherData, updateVoucherData }}>
      {children}
    </VoucherCreationContext.Provider>
  );
};

// Custom hook to use this context
export const useVoucherCreation = (): VoucherCreationContextType => {
  const context = useContext(VoucherCreationContext);
  if (context === undefined) {
    throw new Error(
      "useVoucherCreation must be used within a VoucherCreationProvider"
    );
  }
  return context;
};
