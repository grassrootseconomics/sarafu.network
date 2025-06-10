import { createPublicClient, fallback, http } from "viem";
import { celo } from "wagmi/chains";

// Get projectId from https://cloud.reown.com
export const projectId = "26d03a81230d2bcd268e0434bec65f3a";

export const appName = "Sarafu.Network";

export const celoTransport = fallback([
  http("https://celo.sarafu.africa"),
  http(),
]);

export const publicClient = createPublicClient({
  chain: celo,
  transport: celoTransport,
});

// This CeloChain type will now also be based on our specific celo object
export type CeloChain = typeof celo;
