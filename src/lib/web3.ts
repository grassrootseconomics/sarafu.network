import { CeloWallet, Valora } from "@celo/rainbowkit-celo/wallets";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  braveWallet,
  coinbaseWallet,
  metaMaskWallet,
  omniWallet,
  safeWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { celo, celoAlfajores } from "viem/chains";
import { configureChains, createConfig, type Chain } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { paperWallet } from "./paper-connector/wallet";

export type ChainType = ReturnType<typeof getViemChain>;

export function getViemChain() {
  if (process.env.NEXT_PUBLIC_TESTNET) {
    return celoAlfajores;
  }
  return celo;
}

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [getViemChain()],
  [publicProvider()]
);

const projectId = "26d03a81230d2bcd268e0434bec65f3a";

export const appInfo = {
  appName: "Sarafu.Network",
};
export default function connectors({
  chains,
  appName,
  projectId,
}: {
  chains: Chain[];
  projectId: string;
  appName?: string;
}) {
  return connectorsForWallets([
    {
      groupName: "Celo Only",
      wallets: [
        Valora({ chains, projectId }),
        CeloWallet({ chains, projectId }),
      ],
    },
    {
      groupName: "Supports Celo",
      wallets: [
        paperWallet({ chains }),
        metaMaskWallet({ chains, projectId }),
        trustWallet({ chains, projectId }),
        braveWallet({ chains }), // only shows when in brave and  celo chains are configured in brave wallet
        safeWallet({ chains }),
        omniWallet({ chains, projectId }),
        walletConnectWallet({ chains, projectId }),
      ].concat(appName ? [coinbaseWallet({ appName, chains })] : []),
    },
  ]);
}
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: connectors({
    chains,
    appName: appInfo.appName,
    projectId,
  }),
  publicClient,
  webSocketPublicClient,
});

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
