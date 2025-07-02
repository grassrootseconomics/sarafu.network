"use client";
import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";


import { SessionProvider } from "next-auth/react";
import { useState, type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { config } from "~/config/wagmi.config.client";
import { AuthProvider } from "~/hooks/useAuth";

import { client, trpc } from "~/lib/trpc";
import { createQueryClient } from "~/lib/query-client";

// Set up queryClient

let clientQueryClientSingleton: QueryClient | undefined = undefined;

const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    return (clientQueryClientSingleton ??= createQueryClient());
  }
};


function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const [queryClient] = useState(() => getQueryClient());

  const initialState = cookieToInitialState(config as Config, cookies);

  const [trpcClient] = useState(() => client);

  return (
    <SessionProvider>
      <WagmiProvider config={config} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            <AuthProvider>
              <RainbowKitProvider>{children}</RainbowKitProvider>
            </AuthProvider>
          </trpc.Provider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}

export default ContextProvider;
