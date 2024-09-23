import { transactionRouter } from "~/server/api/routers/transaction";
import { voucherRouter } from "~/server/api/routers/voucher";

import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "./routers/auth";
import { gasRouter } from "./routers/gas";
import { meRouter } from "./routers/me";
import { poolRouter } from "./routers/pool";
import { productsRouter } from "./routers/products";
import { statsRouter } from "./routers/stats";
import { tagsRouter } from "./routers/tags";
import { userRouter } from "./routers/user";

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
  products: productsRouter,
  pool: poolRouter,
  tags: tagsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
