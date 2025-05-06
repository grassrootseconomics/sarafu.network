"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import {
  useAccount,
  useDisconnect,
  type Config,
  type UseAccountReturnType,
} from "wagmi";

import { RainbowKitAuthenticationProvider } from "@rainbow-me/rainbowkit";
import { type Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import React, { type ReactNode } from "react";
import { authenticationAdapter } from "~/config/siwe";
import { trpc } from "~/lib/trpc";
import { type RouterOutput } from "~/server/api/root";
import {
  hasPermission as checkPermission,
  isAdmin,
  isStaff,
  isSuperAdmin,
  type Permissions,
} from "~/utils/permissions";

export type AuthContextType = {
  user: RouterOutput["me"]["get"] | undefined;
  session: Session | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  gasStatus: "APPROVED" | "REQUESTED" | "REJECTED" | "NONE" | undefined;
  account: UseAccountReturnType<Config>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const account = useAccount();
  const { disconnect } = useDisconnect();

  // Handle wallet connection/disconnection
  useEffect(() => {
    const handleDisconnect = async () => {
      try {
        await signOut({ redirect: false });
      } catch (error) {
        console.error("Failed to sign out:", error);
      }
    };

    // If wallet disconnects, clear the session
    if (!account.isConnected && session?.address) {
      void handleDisconnect();
    }

    // If addresses don't match, disconnect wallet and clear session
    if (session?.address && account.address) {
      if (session.address.toLowerCase() !== account.address.toLowerCase()) {
        console.warn("Address mismatch detected:", {
          sessionAddress: session.address,
          wagmiAddress: account.address,
          status,
          isConnected: account.isConnected,
        });
        disconnect();
        void handleDisconnect();
      }
    }
  }, [
    session?.address,
    account.address,
    account.isConnected,
    status,
    disconnect,
  ]);

  const me = trpc.me.get.useQuery(undefined, {
    enabled: !!session?.address && !!account.isConnected,
  });

  const gas = trpc.me.gasStatus.useQuery(undefined, {
    enabled: !!session?.address && !!account.isConnected,
  });

  useEffect(() => {
    if (session?.address && account.isConnected) {
      void me.refetch();
    }
  }, [session?.address, account.isConnected, me]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user: me.data,
      session: session,
      gasStatus: gas.data,
      account: account,
      isSuperAdmin: isSuperAdmin(session?.user),
      isAdmin: isAdmin(session?.user) || isSuperAdmin(session?.user),
      isStaff:
        isStaff(session?.user) ||
        isAdmin(session?.user) ||
        isSuperAdmin(session?.user),
      loading: status === "loading",
    }),
    [account, me.data, session, gas.data, status]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      <RainbowKitAuthenticationProvider
        adapter={authenticationAdapter}
        status={status}
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
    throw new Error("useAuth must be used within an AuthProvider");
  }

  if (!context.session?.address || !context.account.isConnected) return null;

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

export function usePermission<T extends keyof Permissions>(
  resource: T,
  action: keyof Permissions[T],
  isOwner?: boolean
) {
  const auth = useAuth();
  if (!auth?.user) return null;
  return checkPermission(auth.user, isOwner ?? false, resource, action);
}
