"use client";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { cookieStorage, createConfig, createStorage, fallback, http } from "@wagmi/core";
import { celo } from "viem/chains";

import {
  frameWallet,
  injectedWallet,
  metaMaskWallet,
  omniWallet,
  safeWallet,
  trustWallet,
  valoraWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { paperWallet } from "~/lib/paper-connector/wallet";
import { env } from "~/env";
// Get projectId from https://cloud.reown.com
export const projectId = "26d03a81230d2bcd268e0434bec65f3a";

export const appName = "Sarafu.Network";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

const connectors = connectorsForWallets(
  [
    {
      groupName: "Supports Celo",
      wallets: [
        injectedWallet,
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

export const transports = {
  [celo.id]: fallback([
    http(env.NEXT_PUBLIC_CELO_RPC, {
      batch: true,
    }),
    http(celo.rpcUrls.default.http[0], {
      batch: true,
    }),
  ]),
};
//Set up the Wagmi Adapter (Config)
export const config = createConfig({
  storage: createStorage({
    storage: cookieStorage,
  }),
  connectors,
  ssr: true,
  chains: [celo] as const,
  transports: transports,
});
