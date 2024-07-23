import { getPaperWalletConnector } from "@grassroots/paper-wallet";
import {
  getWalletConnectConnector,
  WalletDetailsParams,
  type RainbowKitWalletConnectParameters,
  type Wallet,
} from "@rainbow-me/rainbowkit";
import { createConnector } from "wagmi";
import { getViemChain } from "./web3";
export function isAndroid(): boolean {
  return (
    typeof navigator !== "undefined" && /android/i.test(navigator.userAgent)
  );
}
export const valora = ({
  projectId,
  walletConnectParameters,
}: {
  projectId: string;
  walletConnectParameters?: RainbowKitWalletConnectParameters;
}): Wallet => ({
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


export const paperWallet = (): Wallet => ({
  id: "paper",
  name: "Paper Wallet",
  iconUrl: "/apple-touch-icon.png",
  iconAccent: "#f6851a",
  iconBackground: "#fff",

  createConnector: (walletDetails: WalletDetailsParams) => {
    return createConnector((config: any) => ({
      ...getPaperWalletConnector({
        chain: getViemChain(),
      })(config),
      ...walletDetails,
    }));
  },
});
