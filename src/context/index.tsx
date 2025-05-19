"use client";
import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  httpBatchLink,
  loggerLink,
  splitLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import { SessionProvider } from "next-auth/react";
import { useState, type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { config } from "~/config/wagmi.config.client";
import { AuthProvider } from "~/hooks/useAuth";
import { createQueryClient } from "~/lib/query-client";
import { trpc } from "~/lib/trpc";
import SuperJson from "~/utils/trpc-transformer";

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

const getUrl = () => {
  const base = (() => {
    if (typeof window !== "undefined") return window.location.origin;
    if (process.env.APP_URL) return process.env.APP_URL;
    return `http://localhost:${process.env.PORT ?? 3000}`;
  })();

  return `${base}/api/trpc`;
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

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        // adds pretty logs to your console in development and logs errors in production
        ...(process.env.NODE_ENV === "development" ? [loggerLink()] : []),
        splitLink({
          condition(op) {
            // check for context property `stream`
            return Boolean(op.context.stream);
          },
          false: httpBatchLink({
            // uses the httpLink for non-batched requests
            url: getUrl(),
            transformer: SuperJson,
          }),
          true: unstable_httpBatchStreamLink({
            // uses the httpSubscriptionLink for subscriptions
            url: getUrl(),
            transformer: SuperJson,
          }),
        }),
      ],
    })
  );

  return (
    <SessionProvider>
      <WagmiProvider config={config as Config} initialState={initialState}>
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
