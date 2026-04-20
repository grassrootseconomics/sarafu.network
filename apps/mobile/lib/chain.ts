import { createPublicClient, fallback, http } from "viem";
import { celo } from "viem/chains";

export const celoTransport = fallback([
  http("https://r4-celo.grassecon.org"),
  http(),
]);

export const publicClient = createPublicClient({
  chain: celo,
  transport: celoTransport,
});
