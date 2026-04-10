import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useRef, useState, type ReactNode } from "react";
import SuperJson from "@sarafu/schemas/trpc-transformer";
import type { AppRouter } from "@sarafu/api/root";
import { getApiBaseUrl } from "./api-url";
import { useAuth } from "./auth";

export const trpc = createTRPCReact<AppRouter>();

function useTRPCClient() {
  const { token } = useAuth();
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const [client] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            __DEV__ ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getApiBaseUrl()}/api/trpc`,
          transformer: SuperJson,
          headers() {
            const headers: Record<string, string> = {};
            if (tokenRef.current) {
              headers["Authorization"] = `Bearer ${tokenRef.current}`;
            }
            return headers;
          },
        }),
      ],
    })
  );

  return client;
}

export function TRPCProvider({ children }: { children: ReactNode }) {
  const client = useTRPCClient();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 2,
          },
        },
      })
  );

  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
