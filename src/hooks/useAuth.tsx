import type { AuthenticationStatus } from "@rainbow-me/rainbowkit";
import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from "@rainbow-me/rainbowkit";

import { type IronSession } from "iron-session";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { SiweMessage } from "siwe";
import { useAccount } from "wagmi";
import { AccountRoleType } from "~/server/enums";
import { api } from "~/utils/api";
import { useSession } from "../hooks/useSession";
type AuthContextType = {
  user: IronSession["user"];
  adapter: ReturnType<typeof createAuthenticationAdapter<SiweMessage>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  let sessionStatus: AuthenticationStatus = "unauthenticated";
  const utils = api.useContext();
  const { authenticated, loading, user, refetch } = useSession();
  const account = useAccount();
  const { refetch: getNonce } = api.auth.getNonce.useQuery(undefined, {
    enabled: false,
  });

  const { mutateAsync: verify } = api.auth.verify.useMutation({
    onSuccess: () => {
      void utils.auth.invalidate();
    },
  });

  const { mutateAsync: logOut } = api.auth.logout.useMutation({
    onSuccess: () => {
      void utils.auth.invalidate();
    },
  });

  const adapter = useMemo(
    () =>
      createAuthenticationAdapter({
        getNonce: async () => {
          const { data: nonce } = await getNonce();
          return nonce ?? "";
        },

        createMessage: ({ nonce, address, chainId }) => {
          return new SiweMessage({
            domain: window.location.host,
            address,
            statement: "Sign in with Ethereum to the app.",
            uri: window.location.origin,
            version: "1",
            chainId,
            nonce,
          });
        },

        getMessageBody: ({ message }) => {
          return message.prepareMessage();
        },

        verify: async ({ message, signature }) => {
          const verified = await verify({
            message,
            signature,
          });
          return verified;
        },

        signOut: async () => {
          const success = await logOut();
          if (!success) {
            throw new Error("Failed to logout");
          }
        },
      }),
    [getNonce, verify, logOut]
  );
  const contextValue = useMemo<AuthContextType>(
    () => ({ user, adapter }),
    [user, adapter]
  );
  if (loading) sessionStatus = "loading";
  if (authenticated && account?.address == user.account.blockchain_address)
    sessionStatus = "authenticated";
  const fetchStatus = useCallback(() => {
    console.log("Fetching Status");
    if (loading) {
      return;
    }
    void refetch?.();
  }, []);

  useEffect(() => {
    fetchStatus();
    window.addEventListener("focus", fetchStatus);

    return () => {
      window.removeEventListener("focus", fetchStatus);
    };
  }, [fetchStatus]);
  return (
    <AuthContext.Provider value={contextValue}>
      <RainbowKitAuthenticationProvider
        adapter={adapter}
        status={sessionStatus}
      >
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
  if (!context.user) return null;
  return {
    ...context.user,
    isAdmin: context.user?.role === AccountRoleType.ADMIN,
    isStaff:
      context.user?.role === AccountRoleType.STAFF ||
      context.user?.role === AccountRoleType.ADMIN,
  };
};
