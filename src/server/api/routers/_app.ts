/**
 * This file contains the root router of your tRPC-backend
 */
import { createCallerFactory } from "@trpc/server/unstable-core-do-not-import";
import { cache } from "react";
import { auth } from "../auth";
import type { Context } from "../context";
import { router } from "../trpc";

import { graphDB, federatedDB } from "~/server/db";
import { checkoutRouter } from "./checkout";
import { ensRouter } from "./ens";
import { gasRouter } from "./gas";
import { meRouter } from "./me";
import { poolRouter } from "./pool";
import { productsRouter } from "./products";
import { reportRouter } from "./report";
import { statsRouter } from "./stats";
import { tagsRouter } from "./tags";
import { transactionRouter } from "./transaction";
import { userRouter } from "./user";
import { voucherRouter } from "./voucher";

export const appRouter = router({
  transaction: transactionRouter,
  voucher: voucherRouter,
  user: userRouter,
  me: meRouter,
  report: reportRouter,
  gas: gasRouter,
  stats: statsRouter,
  products: productsRouter,
  pool: poolRouter,
  tags: tagsRouter,
  checkout: checkoutRouter,
  ens: ensRouter,
});

export type AppRouter = typeof appRouter;

const createCallerContext = cache(
  async (): Promise<Context> => ({
    session: await auth(),
    graphDB: graphDB,
    federatedDB: federatedDB,
    ip: "unknown",
  })
);

export const caller = createCallerFactory()(appRouter)(createCallerContext);
