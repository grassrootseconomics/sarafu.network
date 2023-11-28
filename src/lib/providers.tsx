/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import { AuthProvider } from "~/hooks/useAuth";
import { appInfo, chains, wagmiConfig } from "./web3";

export default function Providers({ children }: { children: React.ReactNode }) {
  // const { adapter, status } = useAuth();
  return (
    <WagmiConfig config={wagmiConfig}>
      <AuthProvider>
        <RainbowKitProvider appInfo={appInfo} chains={chains}>
          {children}
        </RainbowKitProvider>
      </AuthProvider>
    </WagmiConfig>
  );
}
