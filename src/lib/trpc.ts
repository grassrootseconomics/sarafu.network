import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/routers/_app";

import {
  httpBatchLink,
  loggerLink,
  splitLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import SuperJson from "~/utils/trpc-transformer";

const getUrl = () => {
  const base = (() => {
    if (typeof window !== "undefined") return window.location.origin;
    if (process.env.APP_URL) return process.env.APP_URL;
    return `http://localhost:${process.env.PORT ?? 3000}`;
  })();

  return `${base}/api/trpc`;
};
export const trpc = createTRPCReact<AppRouter>({});

export const client = trpc.createClient({
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
        maxItems: 5,
        transformer: SuperJson,
      }),
      true: unstable_httpBatchStreamLink({
        // uses the httpSubscriptionLink for subscriptions
        url: getUrl(),
        transformer: SuperJson,
      }),
    }),
  ],
});
export type RouterOutputs = inferRouterOutputs<AppRouter>;
