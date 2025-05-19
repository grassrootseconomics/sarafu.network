import { createPublicClient, fallback, http } from "viem";
// Import our canonical 'celo' chain definition instead of the generic one from viem/chains
// import { celo } from "viem/chains";
import { celo as celoBase } from "viem/chains";

// Get projectId from https://cloud.reown.com
export const projectId = "26d03a81230d2bcd268e0434bec65f3a";

export const appName = "Sarafu.Network";

export const celo = {
  ...celoBase,
  blockExplorers: {
    default: {
      name: "Celo Explorer",
      url: "https://celoscan.io",
      apiUrl: "https://api.celoscan.io/api",
    },
  },
} as const;

export const celoTransport = fallback([
  http("https://r1-celo.grassecon.org/"),
  http("https://r2-celo.grassecon.org/"),
  http("https://r3-celo.grassecon.org/"),
  http("https://r4-celo.grassecon.org/"),
  http(),
]);

export const publicClient = createPublicClient({
  chain: celo, // This will now use our specific, readonly celo chain
  transport: celoTransport,
});

// This CeloChain type will now also be based on our specific celo object
export type CeloChain = typeof celo;
