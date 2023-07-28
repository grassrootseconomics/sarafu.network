import {
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter,
  type AuthenticationStatus,
} from "@rainbow-me/rainbowkit";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SiweMessage } from "siwe";
import { useAccount } from "wagmi";
import { type RouterOutput } from "~/server/api/root";
import { AccountRoleType } from "~/server/enums";
import { api } from "~/utils/api";

type AuthContextType = {
  user: RouterOutput["auth"]["me"] | null;
  adapter: ReturnType<typeof createAuthenticationAdapter<SiweMessage>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const createMessage = ({
  nonce,
  address,
  chainId,
}: {
  nonce: string;
  address: string;
  chainId: number;
}) => {
  const message = new SiweMessage({
    domain: window.location.host,
    address,
    statement: "Sign in with Ethereum to the app.",
    uri: window.location.origin,
    version: "1",
    chainId,
    nonce,
  });
  return message;
};

const getMessageBody = ({ message }: { message: SiweMessage }) => {
  return message.prepareMessage();
};
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const fetchingStatusRef = useRef(false);
  const verifyingRef = useRef(false);
  const account = useAccount();

  const [user, setUser] = useState<RouterOutput["auth"]["me"]>(null);
  const nonce = api.auth.nonce.useQuery(undefined, {
    enabled: false,
    cacheTime: 0,
  });

  const me = api.auth.me.useQuery(undefined, {
    enabled: false,
    cacheTime: 0,
  });

  const logout = api.auth.logout.useQuery(undefined, {
    enabled: false,
    cacheTime: 0,
  });

  const verify = api.auth.verify.useMutation();

  const adapter = useMemo(() => {
    return createAuthenticationAdapter({
      getNonce: async () => {
        const req = await nonce.refetch();
        if (!req.data) throw new Error("No nonce");
        return req.data;
      },
      createMessage,
      getMessageBody,
      verify: async ({ message, signature }) => {
        verifyingRef.current = true;

        try {
          const isVerified = await verify.mutateAsync({
            message,
            signature,
          });
          if (!isVerified) {
            setUser(null);
            return false;
          }
          const { data } = await me.refetch();
          if (data) {
            setUser(data);
          }
          return isVerified;
        } catch (error) {
          return false;
        } finally {
          verifyingRef.current = false;
        }
      },

      signOut: async () => {
        setUser(null);
        await logout.refetch();
      },
    });
  }, []);

  useEffect(() => {
    if (
      user?.account.blockchain_address &&
      user?.account.blockchain_address !== account.address
    ) {
      void adapter.signOut();
    }
  }, [user?.account.blockchain_address, account.address]);

  const contextValue = useMemo<AuthContextType>(
    () => ({ user, adapter }),
    [user, adapter]
  );
  const fetchStatus = useCallback(() => {
    console.log("Fetching Status");
    if (fetchingStatusRef.current || verifyingRef.current) {
      return;
    }

    fetchingStatusRef.current = true;

    me.refetch()
      .then((res) => {
        if (!res.data || !res.data.account.blockchain_address)
          throw new Error("No user");
        setUser(res.data);
      })
      .catch((error) => {
        console.error(error);
        void adapter.signOut();
      })
      .finally(() => {
        fetchingStatusRef.current = false;
      });
  }, []);

  useEffect(() => {
    fetchStatus();
    window.addEventListener("focus", fetchStatus);

    return () => {
      window.removeEventListener("focus", fetchStatus);
    };
  }, [fetchStatus]);
  const status: AuthenticationStatus = useMemo(() => {
    if (!user) {
      return "unauthenticated";
    }
    if (!user.account.blockchain_address) {
      return "unauthenticated";
    }
    if (verifyingRef.current) {
      return "loading";
    }
    return "authenticated";
  }, [user]);

  return (
    <AuthContext.Provider value={contextValue}>
      <RainbowKitAuthenticationProvider adapter={adapter} status={status}>
        {children}
      </RainbowKitAuthenticationProvider>
    </AuthContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  return {
    ...context.user,
    isAdmin: context.user?.role === AccountRoleType.ADMIN,
    isStaff:
      context.user?.role === AccountRoleType.STAFF ||
      context.user?.role === AccountRoleType.ADMIN,
  };
};
