import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Hex } from "viem";
import {
  loadWallet,
  generateWallet as generateWalletCore,
  storeWallet,
  deleteWallet as deleteWalletCore,
  importWallet as importWalletCore,
  type WalletInfo,
} from "./wallet";

interface WalletContextValue {
  wallet: WalletInfo | null;
  isLoading: boolean;
  createWallet: () => { mnemonic: string; address: Hex; privateKey: Hex };
  finalizeWallet: (
    mnemonic: string,
    privateKey: Hex,
    address: Hex
  ) => Promise<void>;
  importWallet: (mnemonic: string) => Promise<void>;
  resetWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWallet()
      .then(setWallet)
      .finally(() => setIsLoading(false));
  }, []);

  const createWallet = useCallback(() => {
    return generateWalletCore();
  }, []);

  const finalizeWallet = useCallback(
    async (mnemonic: string, privateKey: Hex, address: Hex) => {
      await storeWallet(mnemonic, privateKey, address);
      setWallet({ address, hasWallet: true });
    },
    []
  );

  const importWalletFn = useCallback(async (mnemonic: string) => {
    const info = await importWalletCore(mnemonic);
    setWallet(info);
  }, []);

  const resetWallet = useCallback(async () => {
    await deleteWalletCore();
    setWallet(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isLoading,
        createWallet,
        finalizeWallet,
        importWallet: importWalletFn,
        resetWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
