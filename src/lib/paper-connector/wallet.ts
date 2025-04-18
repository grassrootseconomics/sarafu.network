import { type WalletDetailsParams, type Wallet } from "@rainbow-me/rainbowkit";
import { createConnector as wagmiCreateConnector } from "wagmi";
import { paperConnect } from "./paper_connector";


export const paperWallet = (): Wallet => ({
  id: "paper",
  name: "Paper Wallet",
  iconUrl: "/apple-touch-icon.png",
  iconAccent: "#f6851a",
  iconBackground: "#fff",

  createConnector: (walletDetails: WalletDetailsParams) => {
    return wagmiCreateConnector((config) => ({
      ...paperConnect()(config),
      ...walletDetails,
    }));
  },
});


export const paperConnector = wagmiCreateConnector((config) => ({
  ...paperConnect()(config),
  icon:  "/apple-touch-icon.png",
}));