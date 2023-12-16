import { transactionRouter } from "~/server/api/routers/transaction";
import { voucherRouter } from "~/server/api/routers/voucher";

import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "./routers/auth";
import { meRouter } from "./routers/me";
import { statsRouter } from "./routers/stats";
import { userRouter } from "./routers/user";
import { gasRouter } from "./routers/gas";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  transaction: transactionRouter,
  voucher: voucherRouter,
  user: userRouter,
  me: meRouter,
  auth: authRouter,
  gas: gasRouter,
  stats: statsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
