import type { AuthenticationStatus } from "@rainbow-me/rainbowkit";
import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from "@rainbow-me/rainbowkit";

import { SiwViemMessage } from "@feelsgoodman/siwviem";
import { useRouter } from "next/router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useAccount, type Config, type UseAccountReturnType } from "wagmi";
import { type SessionData } from "~/lib/session";
import { AccountRoleType } from "~/server/enums";
import { api } from "~/utils/api";
import { useSession } from "./useSession";
export type AuthContextType = {
  user: SessionData["user"];
  adapter: ReturnType<typeof createAuthenticationAdapter<SiwViemMessage>>;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  gasStatus: "APPROVED" | "REQUESTED" | "REJECTED" | "NONE" | undefined;
  account: UseAccountReturnType<Config>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuthAdapter = () => {
  const utils = api.useUtils();
  const router = useRouter();
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
      void utils.invalidate();
      void router.push("/").catch(console.error);
    },
  });

  const adapter = useMemo(
    () =>
      createAuthenticationAdapter({
        getNonce: async () => {
          const { data: nonce } = await getNonce();
          if (!nonce) throw new Error("Nonce is undefined");
          return nonce;
        },

        createMessage: ({ nonce, address, chainId }) => {
          if (!nonce) throw new Error("Nonce is undefined");
          return new SiwViemMessage({
            domain: window.location.host,
            address: address as `0x${string}`,
            statement: "Sign in with Ethereum to the app.",
            uri: window.location.origin,
            version: "1",
            chainId,
            nonce: nonce,
          });
        },

        getMessageBody: ({ message }) => {
          const preparedMessage = message.prepareMessage();
          return preparedMessage;
        },

        verify: async ({ message, signature }) => {
          if (typeof message.nonce !== "string")
            throw new Error("Nonce is undefined");
          const verified = await verify({
            message,
            signature,
          });
          return verified;
        },

        signOut: async () => {
          console.log("signOut Called");
          const success = await logOut();
          if (!success) {
            throw new Error("Failed to logout");
          }
        },
      }),
    [getNonce, verify, logOut]
  );
  return {
    adapter,
  };
};
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  let sessionStatus: AuthenticationStatus = "unauthenticated";

  const session = useSession();
  const account = useAccount();
  const { adapter } = useAuthAdapter();

  if (session.isLoading) sessionStatus = "loading";
  if (
    session.authenticated &&
    account?.address == session.user.account.blockchain_address
  )
    sessionStatus = "authenticated";

  const fetchStatus = useCallback(() => {
    if (session.isLoading) {
      return;
    }
    void session.refetch?.();
  }, [session]);

  useEffect(() => {
    fetchStatus();
    window.addEventListener("focus", fetchStatus);

    return () => {
      window.removeEventListener("focus", fetchStatus);
    };
  }, [fetchStatus]);
  const { data: gasStatus } = api.me.gasStatus.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user: session.user,
      gasStatus: gasStatus,
      account: account,
      isAdmin: session.user?.role === AccountRoleType.ADMIN,
      isStaff:
        session.user?.role === AccountRoleType.STAFF ||
        session.user?.role === AccountRoleType.ADMIN,
      adapter,
      loading: session.isLoading,
    }),
    [account, adapter, gasStatus, session.isLoading, session.user]
  );

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
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }

  if (!context.user || !context.account.isConnected) return null;

  return context;
};
