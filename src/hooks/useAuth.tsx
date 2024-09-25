"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { useAccount, type Config, type UseAccountReturnType } from "wagmi";

import { RainbowKitAuthenticationProvider } from "@rainbow-me/rainbowkit";
import { type Session } from "next-auth";
import { useSession } from "next-auth/react";
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
  const { data: session, status } = useSession(); // useSession()
  const me = trpc.me.get.useQuery(undefined, {
    enabled: !!session?.address,
  });
  const gas = trpc.me.gasStatus.useQuery(undefined, {
    enabled: !!session?.address,
  });
  const account = useAccount();
  useEffect(() => {
    console.log("Refetch Session");
    void me.refetch();
  }, [session]);
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
      loading: false,
    }),
    [account, me.data, session, gas.data]
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
    throw new Error("useUser must be used within an AuthProvider");
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
