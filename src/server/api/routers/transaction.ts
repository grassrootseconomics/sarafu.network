import { sql } from "kysely";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const transactionRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.kysely
      .selectFrom("transactions")
      .selectAll()
      .limit(100)
      .orderBy("date_block", "desc")
      .execute();
    return result;
  }),
  transactionsPerDay: publicProcedure
    .input(z.object({ voucherAddress: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const start = new Date("2023-06-01");
      const end = new Date();
      if (input?.voucherAddress) {
        const result = await sql<{ x: Date; y: string }>`WITH date_range AS (
      SELECT day::date FROM generate_series(${start}, ${end}, INTERVAL '1 day') day
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
      SELECT day::date FROM generate_series(${start}, ${end}, INTERVAL '1 day') day
    ),
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
