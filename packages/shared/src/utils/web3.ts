import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  frameWallet,
  metaMaskWallet,
  omniWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { celo, celoAlfajores } from "@wagmi/chains";
import { Config, getPublicClient } from "@wagmi/core";
import { HttpTransport, PublicClient } from "viem";
import { createConfig, http } from "wagmi";
import { paperWallet, valora } from "./custom-wallets";

export type ChainType = ReturnType<typeof getViemChain>;

const isTestnet = Boolean(process.env.NEXT_PUBLIC_TESTNET)
export function getViemChain() {
  if (isTestnet) {
    return celoAlfajores;
  }
  return celo;
}

const chain = process.env.NEXT_PUBLIC_TESTNET ? celoAlfajores : celo;

const projectId = "26d03a81230d2bcd268e0434bec65f3a";

export const appName = "Sarafu.Network";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Supports Celo",
      wallets: [
        paperWallet,
        metaMaskWallet,
        valora,
        trustWallet,
        walletConnectWallet,
        frameWallet,
        omniWallet,
      ],
    },
  ],
  {
    projectId,
    appName: appName,
  }
);

export const config: Config<[ChainType]> = createConfig({
      connectors: connectors,
      ssr: true,
      chains: [chain],
      transports: {
        [celoAlfajores.id]: http(),
        [celo.id]: http(),
      },
    });

export const publicClient = getPublicClient(config) as PublicClient<HttpTransport, ChainType>;
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
