"use client";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { cookieStorage, createConfig, createStorage } from "@wagmi/core";

import {
  // frameWallet,
  injectedWallet,
  metaMaskWallet,
  // omniWallet,
  // safeWallet,
  trustWallet,
  // valoraWallet,
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
  injectedWallet,
  metaMaskWallet,
  // valoraWallet,
  trustWallet,
  walletConnectWallet,
  // frameWallet,
  // safeWallet,``
  // omniWallet,
];
if (typeof window !== "undefined") {
  wallets.push(paperWallet);
}
const connectors = connectorsForWallets(
  [
    {
      groupName: "Supports Celo",
      wallets: wallets,
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
