import { createAuthenticationAdapter } from "@rainbow-me/rainbowkit";
import { getCsrfToken, signIn, signOut } from "next-auth/react";
import { isAddress } from "viem";
import { createSiweMessage } from "viem/siwe";

export const authenticationAdapter = createAuthenticationAdapter<string>({
  createMessage: ({ address, nonce, chainId }) => {
    if (!isAddress(address)) throw new Error("Invalid address");
    return createSiweMessage({
      domain: typeof window !== "undefined" ? window.location.host : "",
      address,
      statement: "Please sign with your account",
      uri: typeof window !== "undefined" ? window.location.origin : "",
      version: "1",
      chainId,
      nonce,
    });
  },
  getMessageBody: ({ message }) => message,
  getNonce: async () => {
    const nonce = await getCsrfToken();
    if (!nonce) {
      throw new Error("Failed to get nonce!");
    }

    return nonce;
  },
  verify: async ({ message, signature }) => {
    try {
      const success = await signIn("credentials", {
        message,
        redirect: false,
        signature,
        callbackUrl: "/wallet",
      });
      console.log(success);
      return Boolean(success?.ok);
    } catch (error) {
      return false;
    }
  },
  signOut: async () => {
    try {
      await signOut({
        redirect: false,
      });
    } catch (error) {
      console.error(error);
    }
  },
});
