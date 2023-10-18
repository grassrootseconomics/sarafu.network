import { sql } from "kysely";
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
      let query = ctx.kysely
        .selectFrom("transactions")
        .selectAll()
        .limit(limit)
        .offset(cursor)
        .orderBy("date_block", "desc");
      if (input?.voucherAddress) {
        query = query.where("voucher_address", "=", input.voucherAddress);
      }
      if (input?.voucherAddress) {
        query = query.where("voucher_address", "=", input.voucherAddress);
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

  txsPerDay: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string().optional(),
        dateRange: z
          .object({
            from: z.date(),
            to: z.date(),
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const from = input.dateRange?.from ?? new Date("2023-06-01");
      const to = input.dateRange?.to ?? new Date();
      if (input?.voucherAddress) {
        const result = await sql<{ x: Date; y: string }>`WITH date_range AS (
      SELECT day::date FROM generate_series(${from}, ${to}, INTERVAL '1 day') day
    )
    SELECT date_range.day AS x, COUNT(transactions.id) AS y
    FROM date_range
    LEFT JOIN transactions ON date_range.day = CAST(transactions.date_block AS date)
    AND transactions.success = true AND transactions.voucher_address = ${input.voucherAddress}
    GROUP BY date_range.day
    ORDER BY date_range.day`.execute(ctx.kysely);
        return result.rows;
      } else {
        const result = await sql<{ x: Date; y: string }>`WITH date_range AS (
      SELECT day::date FROM generate_series(${from}, ${to}, INTERVAL '1 day') day
    )
    SELECT date_range.day AS x, COUNT(transactions.id) AS y
    FROM date_range
    LEFT JOIN transactions ON date_range.day = CAST(transactions.date_block AS date)
    AND transactions.success = true 
    GROUP BY date_range.day
    ORDER BY date_range.day`.execute(ctx.kysely);
        return result.rows;
      }
    }),
});
