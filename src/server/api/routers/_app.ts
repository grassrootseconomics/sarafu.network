/**
 * This file contains the root router of your tRPC-backend
 */
import { createCallerFactory } from "@trpc/server/unstable-core-do-not-import";
import { cache } from "react";
import { auth } from "../auth";
import type { Context } from "../context";
import { router } from "../trpc";

import { graphDB, indexerDB } from "~/server/db";
import { gasRouter } from "./gas";
import { meRouter } from "./me";
import { poolRouter } from "./pool";
import { productsRouter } from "./products";
import { statsRouter } from "./stats";
import { tagsRouter } from "./tags";
import { transactionRouter } from "./transaction";
import { userRouter } from "./user";
import { voucherRouter } from "./voucher";
import { reportRouter } from "./report";
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
});

export type AppRouter = typeof appRouter;

const createCallerContext = cache(
  async (): Promise<Context> => ({
    session: await auth(),
    graphDB: graphDB,
    indexerDB: indexerDB,
    ip: "unknown",
  })
);

export const caller = createCallerFactory()(appRouter)(createCallerContext);
