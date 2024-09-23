import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const transactionRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).nullish(),
        cursor: z.number().nullish(),
        voucherAddress: z.string().nullish(),
        accountAddress: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor ?? 0;
      let query = ctx.indexerDB
        .selectFrom("token_transfer")
        .leftJoin("tx", "tx_id", "tx.id")
        .selectAll()
        .limit(limit)
        .offset(cursor)
        .orderBy("tx.date_block", "desc");
      if (input?.voucherAddress) {
        query = query.where("contract_address", "=", input.voucherAddress);
      }
      if (input?.voucherAddress) {
        query = query.where("contract_address", "=", input.voucherAddress);
      }
      if (input?.accountAddress) {
        const accountAddress = input.accountAddress;
        query = query.where((eb) =>
          eb.or([
            eb("sender_address", "=", accountAddress),
            eb("recipient_address", "=", accountAddress),
          ])
        );
      }
      const transactions = await query.execute();
      return {
        transactions,
        nextCursor: transactions.length == limit ? cursor + limit : undefined,
      };
    }),
});
