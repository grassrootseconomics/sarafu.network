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
import { useAccount } from "wagmi";
import { type SessionData } from "~/lib/session";
import { AccountRoleType } from "~/server/enums";
import { api } from "~/utils/api";
import { useSession } from "./useSession";
type AuthContextType = {
  user: SessionData["user"];
  adapter: ReturnType<typeof createAuthenticationAdapter<SiwViemMessage>>;
  loading: boolean;
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

  const contextValue = useMemo<AuthContextType>(
    () => ({ user: session.user, adapter, loading: session.loading }),
    [adapter, session]
  );
  if (session.loading) sessionStatus = "loading";
  if (
    session.authenticated &&
    account?.address == session.user.account.blockchain_address
  )
    sessionStatus = "authenticated";

  const fetchStatus = useCallback(() => {
    if (session.loading) {
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
  const { data: gasStatus } = api.me.gasStatus.useQuery(undefined, {
    enabled: !!context?.user,
  });
  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  const account = useAccount();

  useEffect(() => {
    if (
      (!context.user || !account.isConnected) &&
      props?.redirectTo &&
      !context.loading
    ) {
      context.adapter.signOut().catch(console.error);
    }
  }, [context.user, context.loading]);

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
