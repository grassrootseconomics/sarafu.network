import type { AuthenticationStatus } from "@rainbow-me/rainbowkit";
import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from "@rainbow-me/rainbowkit";

import LogRocket from "logrocket";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { createSiweMessage, parseSiweMessage } from "viem/siwe";
import { useAccount, type Config, type UseAccountReturnType } from "wagmi";
import { type SessionData } from "~/lib/session";
import { api } from "~/utils/api";
import { useSession } from "./useSession";

import { useQueryClient } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import {
  hasPermission as checkPermission,
  isAdmin,
  isStaff,
  isSuperAdmin,
  type Permissions,
} from "~/utils/permissions";

export type AuthContextType = {
  user: SessionData["user"];
  adapter: ReturnType<typeof createAuthenticationAdapter<string>>;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  gasStatus: "APPROVED" | "REQUESTED" | "REJECTED" | "NONE" | undefined;
  account: UseAccountReturnType<Config>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuthAdapter = () => {
  const utils = api.useUtils();
  const queryClient = useQueryClient();

  const { refetch: getNonce } = api.auth.getNonce.useQuery(undefined, {
    enabled: false,
  });

  const { mutateAsync: verify } = api.auth.verify.useMutation({
    onError: () => {
      void utils.auth.invalidate();
    },
  });

  const { mutateAsync: logOut } = api.auth.logout.useMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries();
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
        getMessageBody: ({ message }: { message: string }) => {
          return message;
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

        verify: async ({ message, signature }) => {
          const { address } = parseSiweMessage(message);
          if (!address) throw new Error("Address is undefined");
          const verified = await verify({
            address: address,
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
  useEffect(() => {
    const address = session?.user?.account.blockchain_address;
    if (!session?.user || !address) return;
    LogRocket.identify(address, {
      name: session.user?.name ?? "",
      role: session.user.role,
      address: account.address ?? "",
      connector: account.connector?.name ?? "",
    });
  }, [session.user, account.address, account.connector?.name]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user: session.user,
      gasStatus: gasStatus,
      account: account,
      isSuperAdmin: isSuperAdmin(session.user),
      isAdmin: isAdmin(session.user) || isSuperAdmin(session.user),
      isStaff:
        isStaff(session.user) ||
        isAdmin(session.user) ||
        isSuperAdmin(session.user),
      loading: session.isLoading,
      adapter,
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

interface AuthorizationProps<T extends keyof Permissions> {
  resource: T;
  action: keyof Permissions[T];
  children: ReactNode;
  isOwner?: boolean;
}
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }

  if (!context.user || !context.account.isConnected) return null;

  return context;
};

export function Authorization<T extends keyof Permissions>({
  resource,
  action,
  children,
  isOwner = false,
}: AuthorizationProps<T>) {
  const auth = useAuth();
  if (!auth?.user) return null;
  if (!checkPermission(auth.user, isOwner, resource, action)) {
    return null;
  }
  return <>{children}</>;
}
