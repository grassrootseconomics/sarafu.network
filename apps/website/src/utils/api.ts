/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { type AppRouter } from "@grassroots/api";
import {
  httpBatchLink,
  loggerLink,
  splitLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";

import SuperJson from "~/utils/trpc-transformer";

const getBaseUrl = () => {
  return `http://localhost:${process.env.PORT ?? 2022}`; //
};

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>({
  config({ ctx: _ctx }) {
    if (typeof window !== "undefined") {
      // during client requests
      return {
        links: [
          splitLink({
            condition(op) {
              // check for context property `skipBatch`

              return Boolean(op.context.stream);
            },
            false: httpBatchLink({
              // uses the httpLink for non-batched requests
              url: `${getBaseUrl()}/trpc`,
              transformer: SuperJson,
              fetch(url, options) {
                return fetch(url, {
                  ...options,
                  credentials: "include",
                });
              },
            }),
            true: unstable_httpBatchStreamLink({
              // uses the httpSubscriptionLink for subscriptions
              url: `${getBaseUrl()}/trpc`,
              transformer: SuperJson,
              fetch(url, options) {
                return fetch(url, {
                  ...options,
                  credentials: "include",
                });
              },
            }),
          }),
        ],
      };
    }
    return {
      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        splitLink({
          condition(op) {
            // check for context property `skipBatch`

            return Boolean(op.context.stream);
          },
          false: httpBatchLink({
            // uses the httpLink for non-batched requests
            url: `${getBaseUrl()}/trpc`,
            transformer: SuperJson,
            fetch(url, options) {
              return fetch(url, {
                ...options,
                credentials: "include",
              });
            },
          }),
          true: unstable_httpBatchStreamLink({
            // uses the httpSubscriptionLink for subscriptions
            url: `${getBaseUrl()}/trpc`,
            transformer: SuperJson,
            fetch(url, options) {
              return fetch(url, {
                ...options,
                credentials: "include",
              });
            },
          }),
        }),
      ],
    };
  },
  transformer: SuperJson,
  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
});

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
