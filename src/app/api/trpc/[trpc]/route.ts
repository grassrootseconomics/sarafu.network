import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "~/server/api/context";
import { appRouter } from "~/server/api/root";
export const maxDuration = 300;

const handler = (req: Request) =>
  fetchRequestHandler({
    router: appRouter,
    req,
    endpoint: "/api/trpc",
    /**
     * @link https://trpc.io/docs/v11/context
     */
    createContext: createContext,
    /**
     * @link https://trpc.io/docs/v11/error-handling
     */
    onError({ error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        // send to bug reporting
        console.error("Something went wrong", error);
      }
    },
  });

export const GET = handler;
export const POST = handler;
