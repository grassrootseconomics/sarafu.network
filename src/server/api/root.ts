import { transactionRouter } from "~/server/api/routers/transaction";
import { voucherRouter } from "~/server/api/routers/voucher";

import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  transaction: transactionRouter,
  voucher: voucherRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
