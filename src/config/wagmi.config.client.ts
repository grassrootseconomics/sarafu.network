"use client";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { cookieStorage, createConfig, createStorage } from "@wagmi/core";

import {
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { celo } from "wagmi/chains";
import { paperWallet } from "~/lib/paper-connector/wallet";
import { appName, celoTransport, projectId } from "./viem.config.server";
declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
const wallets = [
  rabbyWallet,
  walletConnectWallet,


];
if (typeof window !== "undefined") {
  wallets.unshift(paperWallet);
}

const secondaryWallets = [
  injectedWallet,
  trustWallet,
  metaMaskWallet,
]

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: wallets,
    },
    {
      groupName: "Supports Celo",
      wallets: secondaryWallets,
    },
  ],
  {
    projectId,
    appName,
  }
);

export const config = createConfig({
  chains: [celo],
  ssr: true,
  connectors,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [celo.id]: celoTransport,
  },
});
