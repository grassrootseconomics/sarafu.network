import { celo } from "@wagmi/chains";
import { getPublicClient } from "@wagmi/core";
import { createPublicClient, type PublicClient, type Transport } from "viem";
import { transports, config as wagmiConfig } from "~/config/wagmi";

export const config = wagmiConfig;

// Create a fallback client for server-side usage
export const fallbackClient = createPublicClient({
  chain: celo,
  transport: transports[celo.id],
});

// The issue with publicClient being undefined is because getPublicClient
// relies on React context providers being initialized first
// Instead of exporting the client directly, export a function to get it on-demand
export function getCeloClient() {
  if (typeof window === "undefined") {
    // We're on server, return the fallback client
    return fallbackClient;
  }

  try {
    // For client-side, use the Wagmi client
    return getPublicClient(wagmiConfig, {
      chainId: celo.id,
    }) as unknown as PublicClient<Transport, typeof celo>;
  } catch (error) {
    console.error("Failed to get public client:", error);
    // Return the fallback client as a backup
    return fallbackClient;
  }
}
