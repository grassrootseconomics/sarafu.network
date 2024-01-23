"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { WagmiProvider } from "wagmi";
import { AuthProvider } from "~/hooks/useAuth";
import { appInfo, config } from "./web3";

export const queryClient = new QueryClient();
export default function Providers({ children }: { children: React.ReactNode }) {
  // const { adapter, status } = useAuth();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />

        <AuthProvider>
          <RainbowKitProvider appInfo={appInfo}>{children}</RainbowKitProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
