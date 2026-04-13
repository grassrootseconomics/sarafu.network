import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Hex } from "viem";
import { getAccount } from "./wallet";
import { authenticateWithSIWE } from "./siwe";

const AUTH_TOKEN_KEY = "sarafu_auth_token";
const AUTH_ADDRESS_KEY = "sarafu_auth_address";

interface AuthState {
  token: string | null;
  address: string | null;
  isLoading: boolean;
  onboardingCompleted: boolean | null;
}

interface AuthContextValue extends AuthState {
  signIn: (token: string, address: string) => Promise<void>;
  signOut: () => Promise<void>;
  autoSignIn: () => Promise<boolean>;
  setOnboardingCompleted: (completed: boolean) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    address: null,
    isLoading: true,
    onboardingCompleted: null,
  });

  useEffect(() => {
    async function loadSession() {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      const address = await SecureStore.getItemAsync(AUTH_ADDRESS_KEY);
      setState((s) => ({ ...s, token, address, isLoading: false }));
    }
    loadSession();
  }, []);

  const signIn = useCallback(async (token: string, address: string) => {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    await SecureStore.setItemAsync(AUTH_ADDRESS_KEY, address);
    setState((s) => ({ ...s, token, address, isLoading: false }));
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(AUTH_ADDRESS_KEY);
    setState({
      token: null,
      address: null,
      isLoading: false,
      onboardingCompleted: null,
    });
  }, []);

  /**
   * Silently authenticate using the stored private key.
   * Since the app holds the key, this can re-authenticate without user interaction.
   */
  const autoSignIn = useCallback(async (): Promise<boolean> => {
    try {
      const account = await getAccount();
      if (!account) return false;

      // getAccount returns a PrivateKeyAccount; we need the raw hex key for SIWE
      // Re-read from secure store to get the hex string
      const privateKey = await SecureStore.getItemAsync("sarafu_private_key");
      if (!privateKey) return false;

      const result = await authenticateWithSIWE(privateKey as Hex);
      await signIn(result.token, result.address);
      return true;
    } catch (error) {
      console.error("Auto sign-in failed:", error);
      return false;
    }
  }, [signIn]);

  const setOnboardingCompleted = useCallback((completed: boolean) => {
    setState((s) => ({ ...s, onboardingCompleted: completed }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        autoSignIn,
        setOnboardingCompleted,
        isAuthenticated: !!state.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
