import { getPublicClient } from "@wagmi/core";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  frameWallet,
  metaMaskWallet,
  omniWallet,
  trustWallet,
  valoraWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { celo, celoAlfajores } from "@wagmi/chains";
import { createConfig, http } from "wagmi";
import { paperWallet } from "./paper-connector/wallet";

export type ChainType = ReturnType<typeof getViemChain>;

export function getViemChain() {
  if (process.env.NEXT_PUBLIC_TESTNET) {
    return celoAlfajores;
  }
  return celo;
}

// const chain = process.env.NEXT_PUBLIC_TESTNET ? celoAlfajores : celo;

const projectId = "26d03a81230d2bcd268e0434bec65f3a";

export const appName = "Sarafu.Network";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Supports Celo",
      wallets: [
        paperWallet,
        metaMaskWallet,
        valoraWallet,
        trustWallet,
        walletConnectWallet,
        frameWallet,
        safeWallet,
        omniWallet,
      ],
    },
  ],
  {
    projectId,
    appName: appName,
  }
);

export const config = process.env.NEXT_PUBLIC_TESTNET
  ? createConfig({
      connectors: connectors,
      ssr: true,
      chains: [celoAlfajores],
      transports: {
        [celoAlfajores.id]: http(),
      },
    })
  : createConfig({
      connectors: connectors,
      ssr: true,
      chains: [celo],
      transports: {
        [celo.id]: http(),
      },
    });

export const publicClient = getPublicClient(config);
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
