import { getPublicClient } from "@wagmi/core";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  omniWallet,
  trustWallet,
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

import { getWalletConnectConnector, type Wallet } from "@rainbow-me/rainbowkit";
import type { DefaultWalletOptions } from "@rainbow-me/rainbowkit/dist/wallets/Wallet.js";

export function isAndroid(): boolean {
  return (
    typeof navigator !== "undefined" && /android/i.test(navigator.userAgent)
  );
}

export const valora = ({
  projectId,
  walletConnectParameters,
}: DefaultWalletOptions): Wallet => ({
  id: "valora",
  name: "Valora",
  iconUrl: "/logos/valora.jpg",
  iconBackground: "#FFF",
  downloadUrls: {
    android: "https://play.google.com/store/apps/details?id=co.clabs.valora",
    ios: "https://apps.apple.com/app/id1520414263?mt=8",
    qrCode: "https://valoraapp.com/",
  },
  mobile: {
    getUri: (uri) => {
      return isAndroid()
        ? uri
        : `celo://wallet/wc?uri=${encodeURIComponent(uri)}`;
    },
  },
  qrCode: {
    getUri: (uri: string) => uri,
  },
  createConnector: getWalletConnectConnector({
    projectId,
    walletConnectParameters,
  }),
});

const projectId = "26d03a81230d2bcd268e0434bec65f3a";

export const appInfo = {
  appName: "Sarafu.Network",
};

const connectors = connectorsForWallets(
  [
    {
      groupName: "Celo Only",
      wallets: [valora],
    },
    {
      groupName: "Supports Celo",
      wallets: [
        paperWallet,
        metaMaskWallet,
        trustWallet,
        omniWallet,
        walletConnectWallet,
        coinbaseWallet,
      ],
    },
  ],
  {
    projectId,
    appName: appInfo.appName,
  }
);
export const config = process.env.NEXT_PUBLIC_TESTNET
  ? createConfig({
      connectors: connectors,
      chains: [celoAlfajores],
      transports: {
        [celoAlfajores.id]: http(),
      },
    })
  : createConfig({
      connectors: connectors,

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
