import {
  type inferRouterInputs,
  type inferRouterOutputs,
} from "@trpc/server";
import { router } from "./trpc";
import { checkoutRouter } from "./routers/checkout";
import { ensRouter } from "./routers/ens";
import { gasRouter } from "./routers/gas";
import { meRouter } from "./routers/me";
import { poolRouter } from "./routers/pool";
import { productsRouter } from "./routers/products";
import { profileRouter } from "./routers/profile";
import { reportRouter } from "./routers/report";
import { safeRouter } from "./routers/safe";
import { staffRouter } from "./routers/staff";
import { statsRouter } from "./routers/stats";
import { tagsRouter } from "./routers/tags";
import { transactionRouter } from "./routers/transaction";
import { userRouter } from "./routers/user";
import { voucherRouter } from "./routers/voucher";

export const appRouter = router({
  transaction: transactionRouter,
  voucher: voucherRouter,
  user: userRouter,
  me: meRouter,
  profile: profileRouter,
  report: reportRouter,
  gas: gasRouter,
  stats: statsRouter,
  products: productsRouter,
  pool: poolRouter,
  tags: tagsRouter,
  checkout: checkoutRouter,
  ens: ensRouter,
  staff: staffRouter,
  safe: safeRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
