import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const AUTH_TOKEN_KEY = "sarafu_auth_token";
const AUTH_ADDRESS_KEY = "sarafu_auth_address";

interface AuthState {
  token: string | null;
  address: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (token: string, address: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    address: null,
    isLoading: true,
  });

  useEffect(() => {
    async function loadSession() {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      const address = await SecureStore.getItemAsync(AUTH_ADDRESS_KEY);
      setState({ token, address, isLoading: false });
    }
    loadSession();
  }, []);

  const signIn = useCallback(async (token: string, address: string) => {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    await SecureStore.setItemAsync(AUTH_ADDRESS_KEY, address);
    setState({ token, address, isLoading: false });
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(AUTH_ADDRESS_KEY);
    setState({ token: null, address: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
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
