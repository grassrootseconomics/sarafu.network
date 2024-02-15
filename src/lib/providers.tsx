"use client";

import "@rainbow-me/rainbowkit/styles.css";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  RainbowKitProvider,
  DisclaimerComponent,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { WagmiProvider } from "wagmi";
import { AuthProvider } from "~/hooks/useAuth";
import { appName, config } from "./web3";

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you agree to the Sarafu Network{" "}
    <Link href="https://grassrootseconomics.org/pages/terms-and-conditions">
      Terms and conditions
    </Link>
    .
  </Text>
);

export const queryClient = new QueryClient();
export default function Providers({ children }: { children: React.ReactNode }) {
  // const { adapter, status } = useAuth();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />

        <AuthProvider>
          <RainbowKitProvider
            appInfo={{
              appName: appName,
              disclaimer: Disclaimer,
              learnMoreUrl: "https://docs.grassecon.org/",
            }}
          >
            {children}
          </RainbowKitProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
