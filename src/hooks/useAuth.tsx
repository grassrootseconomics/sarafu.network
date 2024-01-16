import type { AuthenticationStatus } from "@rainbow-me/rainbowkit";
import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from "@rainbow-me/rainbowkit";

import { useRouter } from "next/router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { SiweMessage } from "siwe";
import { useAccount } from "wagmi";
import { type SessionData } from "~/lib/session";
import { AccountRoleType } from "~/server/enums";
import { api } from "~/utils/api";
import { useSession } from "./useSession";
type AuthContextType = {
  user: SessionData["user"];
  adapter: ReturnType<typeof createAuthenticationAdapter<SiweMessage>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  let sessionStatus: AuthenticationStatus = "unauthenticated";
  const utils = api.useUtils();
  const router = useRouter();
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
    onSettled: () => {
      void utils.invalidate();
      void router.push("/").catch(console.error);
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
          const preparedMessage = message.prepareMessage();
          return preparedMessage;
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
export const useUser = (props?: { redirectTo?: string }) => {
  const context = useContext(AuthContext);
  const router = useRouter();
  const { data: gasStatus } = api.me.gasStatus.useQuery(undefined, {
    enabled: !!context?.user,
  });
  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  const account = useAccount();

  useEffect(() => {
    if (!context.user && props?.redirectTo) {
      router.push(props.redirectTo).catch(console.error);
    }
  }, [context.user]);

  if (!context.user || !account.isConnected) return null;

  return {
    ...context.user,
    gasStatus: gasStatus,
    isAdmin: context.user?.role === AccountRoleType.ADMIN,
    isStaff:
      context.user?.role === AccountRoleType.STAFF ||
      context.user?.role === AccountRoleType.ADMIN,
  };
};
