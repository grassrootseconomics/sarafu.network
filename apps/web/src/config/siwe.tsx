import { createAuthenticationAdapter } from "@rainbow-me/rainbowkit";
import { type QueryClient } from "@tanstack/react-query";
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

export function createSiweAdapter(queryClient: QueryClient) {
  return createAuthenticationAdapter({
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10_000);
      try {
        const res = await fetch("/api/auth/nonce", {
          signal: controller.signal,
        });
        const data = (await res.json()) as { nonce: string };
        if (!data.nonce) throw new Error("Failed to get nonce!");
        return data.nonce;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    verify: async ({ message, signature }: VerifyParams) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15_000);
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, signature }),
          signal: controller.signal,
        });

        if (!res.ok) {
          console.error("SIWE verification failed: Sign in not successful");
          return false;
        }
        await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
        return true;
      } catch (error) {
        console.error("SIWE verification failed:", error);
        return false;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    signOut: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5_000);
      try {
        await fetch("/api/auth/signout", {
          method: "POST",
          signal: controller.signal,
        });
      } catch (error) {
        console.error("SIWE signout failed:", error);
      } finally {
        clearTimeout(timeoutId);
      }
    },
  });
}
