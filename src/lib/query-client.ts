import { QueryClient } from "@tanstack/react-query";
import { hashFn } from "wagmi/query";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: hashFn,
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
      },
    },
  });
