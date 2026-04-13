import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Hex } from "viem";

interface PendingWallet {
  mnemonic: string;
  address: Hex;
  privateKey: Hex;
}

interface WalletSetupContextValue {
  pendingWallet: PendingWallet | null;
  setPendingWallet: (wallet: PendingWallet) => void;
  clear: () => void;
}

const WalletSetupContext = createContext<WalletSetupContextValue | null>(null);

/**
 * Temporary context that holds the generated wallet in memory
 * during the creation flow. Cleared after the wallet is persisted
 * to secure store. Never passes mnemonic through route params.
 */
export function WalletSetupProvider({ children }: { children: ReactNode }) {
  const [pendingWallet, setPendingWalletState] =
    useState<PendingWallet | null>(null);

  const setPendingWallet = useCallback((wallet: PendingWallet) => {
    setPendingWalletState(wallet);
  }, []);

  const clear = useCallback(() => {
    setPendingWalletState(null);
  }, []);

  return (
    <WalletSetupContext.Provider
      value={{ pendingWallet, setPendingWallet, clear }}
    >
      {children}
    </WalletSetupContext.Provider>
  );
}

export function useWalletSetup() {
  const ctx = useContext(WalletSetupContext);
  if (!ctx)
    throw new Error("useWalletSetup must be used within WalletSetupProvider");
  return ctx;
}
