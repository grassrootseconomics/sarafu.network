import type { AuthenticationStatus } from "@rainbow-me/rainbowkit";
import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from "@rainbow-me/rainbowkit";
import { createSiweMessage } from "viem/siwe";

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

type AuthContextType = {
  user: SessionData["user"];
  adapter: ReturnType<typeof createAuthenticationAdapter<string>>;
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

  const adapter = useMemo(() => {
    return createAuthenticationAdapter({
      getNonce: async () => {
        const { data: nonce } = await getNonce();
        if (!nonce) throw new Error("Nonce is undefined");
        return nonce;
      },
      createMessage: ({ nonce, address, chainId }) => {
        if (!nonce) throw new Error("Nonce is undefined");
        return createSiweMessage({
          domain: window.location.host,
          address: address as `0x${string}`,
          statement: "Sign in with Ethereum to the app.",
          uri: window.location.origin,
          version: "1",
          chainId,
          nonce: nonce,
        });
      },
      getMessageBody: ({ message }) => message,
      verify: async ({ message, signature }) => {
        return await verify({ message, signature });
      },
      signOut: async () => {
        const success = await logOut();
        if (!success) throw new Error("Failed to logout");
      },
    });
  }, [getNonce, verify, logOut]);

  return { adapter };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const account = useAccount();
  const { adapter } = useAuthAdapter();
  let sessionStatus: AuthenticationStatus = "unauthenticated";

  if (session.isLoading) sessionStatus = "loading";
  if (
    session.authenticated &&
    account?.address === session.user.account.blockchain_address
  ) {
    sessionStatus = "authenticated";
  } else if (
    session.authenticated &&
    account?.address !== session.user.account.blockchain_address
  ) {
    console.error("Session authenticated but account address is different");
    console.error(session, account);
  }

  const fetchStatus = useCallback(() => {
    if (!session.isLoading) {
      void session.refetch?.();
    }
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
      gasStatus,
      account,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  if (!context.user || !context.account.isConnected) return null;
  return context;
};
