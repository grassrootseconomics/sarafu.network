import { createPublicClient, http } from "viem";

import { celo } from "@wagmi/chains";
import { createConfig } from "wagmi";
import { config as wagmiConfig } from "~/config/wagmi";

export function getViemChain() {
  return celo;
}

export const config =  createConfig({
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
export function convertToAbiType(value: string, type: string) {
  switch (type) {
    case "address":
      return value.toLowerCase() as `0x${string}`; // Assuming address values are in lowercase
    case "uint256":
    case "uint":
    case "int256":
    case "int":
      return BigInt(value);
    case "bool":
      return value.toLowerCase() === "true";
    case "string":
      return value;
    default:
      throw new Error(`Unsupported ABI type: ${type}`);
  }
}
