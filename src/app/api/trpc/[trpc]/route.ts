import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/server/api/root";
import { createContext } from "~/server/api/context";
export const maxDuration = 180;

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
