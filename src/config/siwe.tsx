import { createAuthenticationAdapter } from "@rainbow-me/rainbowkit";
import { getCsrfToken, signIn, signOut } from "next-auth/react";
import { isAddress, type Address } from "viem";
import { createSiweMessage } from "viem/siwe";

interface CreateMessageParams {
  address: Address;
  chainId: number;
  nonce: string;
}

interface VerifyParams {
  message: string;
  signature: string;
}

export const authenticationAdapter = createAuthenticationAdapter({
  createMessage: ({ address, chainId, nonce }: CreateMessageParams) => {
    if (!isAddress(address)) throw new Error("Invalid address");

    return createSiweMessage({
      domain: typeof window !== "undefined" ? window.location.host : "",
      address,
      statement:
        "Sign in to Sarafu Network. This will not trigger a blockchain transaction or cost any gas fees.",
      uri: typeof window !== "undefined" ? window.location.origin : "",
      version: "1",
      chainId,
      nonce,
    });
  },
  getNonce: async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Failed to get nonce!");
    return nonce;
  },
  verify: async ({ message, signature }: VerifyParams) => {
    try {
      const success = await signIn("credentials", {
        message,
        redirect: false,
        signature,
        callbackUrl: "/wallet",
      });

      if (!success?.ok) {
        console.error("SIWE verification failed: Sign in not successful");
        return false;
      }
      return true;
    } catch (error) {
      console.error("SIWE verification failed:", error);
      return false;
    }
  },
  signOut: async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error("SIWE signout failed:", error);
    }
  },
});
