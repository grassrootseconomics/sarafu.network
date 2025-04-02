import { createPublicClient, fallback, http } from "viem";
import { celo } from "viem/chains";

// Get projectId from https://cloud.reown.com
export const projectId = "26d03a81230d2bcd268e0434bec65f3a";

export const appName = "Sarafu.Network";

export const celoTransport = fallback([
  http("https://r1-celo.grassecon.org/"),
  http("https://r2-celo.grassecon.org/"),
  http("https://r3-celo.grassecon.org/"),
  http("https://r4-celo.grassecon.org/"),
  http(),
]);

export const publicClient = createPublicClient({
  chain: celo,
  transport: celoTransport,
});

export type CeloChain = typeof celo;
