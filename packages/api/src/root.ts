
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { authRouter } from "./routers/auth";
import { gasRouter } from "./routers/gas";
import { meRouter } from "./routers/me";
import { poolRouter } from "./routers/pool";
import { productsRouter } from "./routers/products";
import { statsRouter } from "./routers/stats";
import { tagsRouter } from "./routers/tags";
import { transactionRouter } from "./routers/transaction";
import { userRouter } from "./routers/user";
import { voucherRouter } from "./routers/voucher";
import { createTRPCRouter } from "./trpc";

const routerConfig: {
  transaction: typeof transactionRouter,
  voucher: typeof voucherRouter,
  user: typeof userRouter,
  me: typeof meRouter,
  auth: typeof authRouter,
  gas: typeof gasRouter,
  stats: typeof statsRouter,
  products: typeof productsRouter,
  pool: typeof poolRouter,
  tags: typeof tagsRouter,
} = {
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
};

export const appRouter = createTRPCRouter(routerConfig);

// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
