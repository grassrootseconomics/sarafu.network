import { type Wallet, type WalletDetailsParams } from "@rainbow-me/rainbowkit";
import { createConnector as wagmiCreateConnector } from "wagmi";
import { paperConnector } from "./paper_connector";

export const paperWallet = (): Wallet => ({
  id: "paperWallet",
  name: "Paper Wallet",
  iconUrl: "/apple-touch-icon.png",
  iconAccent: "#f6851a",
  iconBackground: "#fff",

  createConnector: (walletDetails: WalletDetailsParams) => {
    return wagmiCreateConnector((config) => ({
      ...paperConnector(config),
      ...walletDetails,
    }));
  },
});
