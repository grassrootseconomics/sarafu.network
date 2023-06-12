import {
  connectorsForWallets,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  ledgerWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";

import { celo, celoAlfajores } from "viem/chains";
import { configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

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

const projectId = "YOUR_PROJECT_ID";

const { wallets } = getDefaultWallets({
  appName: "Sarafu.Network",
  projectId,
  chains,
});

export const appInfo = {
  appName: "Sarafu.Network",
};
export const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "Other",
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
]);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export function convertToAbiType(value: string, type: string): any {
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
