import { type Chain, type Wallet } from "@rainbow-me/rainbowkit";
import { PaperConnector, type PaperConnectorOptions } from "./paper_connector";

export interface PaperWalletOptions {
  chains: Chain[];
}
export const paperWallet = ({
  chains,
  ...options
}: PaperWalletOptions & PaperConnectorOptions): Wallet => {
  return {
    id: "paper",
    name: "Paper Wallet",
    iconUrl: "/apple-touch-icon.png",
    iconAccent: "#f6851a",
    iconBackground: "#fff",
    // !TODO fix this
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    createConnector: () => {
      const connector = new PaperConnector({
        chains,
        options: options,
      });

      return {
        connector,
        downloadUrls: {
          android: "http://localhost:3000/paper",
          ios: "http://localhost:3000/paper",
          qrCode: "http://localhost:3000/paper",
        },
        mobile: {
          getUri: () => {
            return "http://localhost:3000/paper";
          },
        },
        qrCode: {
          getUri: () => {
            return "http://localhost:3000/paper";
          },
        },
        extension: {},
      };
    },
  };
};
