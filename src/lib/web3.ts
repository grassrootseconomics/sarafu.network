import { createPublicClient, http } from "viem";

import { celo } from "@wagmi/chains";
import { createConfig } from "wagmi";
import { config as wagmiConfig } from "~/config/wagmi";

export const config = createConfig({
  connectors: [],
  ssr: true,
  chains: [celo],
  transports: {
    [celo.id]: http(celo.rpcUrls.default.http[0]),
  },
});
export const publicClient = createPublicClient({
  ...wagmiConfig,
  chain: celo,
  transport: http(celo.rpcUrls.default.http[0]),
});
