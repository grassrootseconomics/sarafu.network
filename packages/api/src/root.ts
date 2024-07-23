
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { transactionRouter } from "./routers/transaction";
import { voucherRouter } from "./routers/voucher";
import { authRouter } from "./routers/auth";
import { gasRouter } from "./routers/gas";
import { meRouter } from "./routers/me";
import { poolRouter } from "./routers/pool";
import { productsRouter } from "./routers/products";
import { statsRouter } from "./routers/stats";
import { tagsRouter } from "./routers/tags";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";

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
