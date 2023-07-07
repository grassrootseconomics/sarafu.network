/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import { WagmiConfig } from "wagmi";
import { useAuth } from "~/hooks/useAuth";
import { appInfo, chains, wagmiConfig } from "../lib/web3";

export default function Providers({ children }: { children: React.ReactNode }) {
  // const { emotionCache = clientSideEmotionCache } = props;
  const { adapter, status } = useAuth();
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitAuthenticationProvider adapter={adapter} status={status}>
        <RainbowKitProvider appInfo={appInfo} chains={chains}>
          {children}
        </RainbowKitProvider>
      </RainbowKitAuthenticationProvider>
    </WagmiConfig>
  );
}
