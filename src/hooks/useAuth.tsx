import {
  createAuthenticationAdapter,
  type AuthenticationStatus,
} from "@rainbow-me/rainbowkit";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiweMessage } from "siwe";
import { api } from "~/utils/api";

export const useAuth = () => {
  const fetchingStatusRef = useRef(false);
  const verifyingRef = useRef(false);
  const [status, setStatus] = useState<AuthenticationStatus>("loading");
  // Requests
  const nonce = api.auth.nonce.useQuery(undefined, {
    enabled: false,
  });
  const me = api.auth.me.useQuery(undefined, {
    enabled: false,
  });
  const logout = api.auth.logout.useQuery(undefined, {
    enabled: false,
  });
  const verify = api.auth.verify.useMutation();
  // Fetch user when:
  useEffect(() => {
    const fetchStatus = () => {
      if (fetchingStatusRef.current || verifyingRef.current) {
        return;
      }

      fetchingStatusRef.current = true;

      me.refetch()
        .then((user) => {
          setStatus(user.data?.address ? "authenticated" : "unauthenticated");
        })
        .catch((error) => {
          console.error(error);
          setStatus("unauthenticated");
        })
        .finally(() => {
          fetchingStatusRef.current = false;
        });
    };

    // 1. page loads
    fetchStatus();

    // 2. window is focused (in case user logs out of another window)
    window.addEventListener("focus", fetchStatus);
    return () => window.removeEventListener("focus", fetchStatus);
  }, []);

  const adapter = useMemo(() => {
    return createAuthenticationAdapter({
      getNonce: async () => {
        const req = await nonce.refetch();
        if (!req.data) throw new Error("No nonce");
        return req.data;
      },

      createMessage: ({ nonce, address, chainId }) => {
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
      },

      getMessageBody: ({ message }) => {
        const body = message.prepareMessage();
        return body;
      },

      verify: async ({ message, signature }) => {
        verifyingRef.current = true;

        try {
          const isVerified = await verify.mutateAsync({
            message,
            signature,
          });
          setStatus(isVerified ? "authenticated" : "unauthenticated");
          return isVerified;
        } catch (error) {
          return false;
        } finally {
          verifyingRef.current = false;
        }
      },

      signOut: async () => {
        setStatus("unauthenticated");
        await logout.refetch();
      },
    });
  }, []);
  return { status, adapter };
};
