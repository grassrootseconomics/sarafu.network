import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { appRouter as _appRouter } from "~/server/api/routers/_app";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = _appRouter
// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
