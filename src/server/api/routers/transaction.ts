import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const transactionRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.transactions.findMany({
      take: 100,
    });
  }),
  transactionsPerDay: publicProcedure
    .input(z.object({ voucherAddress: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const start = new Date("2023-06-01");
      const end = new Date();
      if (input?.voucherAddress) {
        const result = await ctx.prisma.$queryRaw`WITH date_range AS (
      SELECT day::date FROM generate_series(${start}, ${end}, INTERVAL '1 day') day
    )
    SELECT date_range.day AS x, COUNT(transactions.id) AS y
    FROM date_range
    LEFT JOIN transactions ON date_range.day = CAST(transactions.date_block AS date)
    AND transactions.success = true AND transactions.voucher_address = ${input.voucherAddress}
    GROUP BY date_range.day
    ORDER BY date_range.day`;
        return result as { x: string; y: string }[];
      } else {
        const result = await ctx.prisma.$queryRaw`WITH date_range AS (
      SELECT day::date FROM generate_series(${start}, ${end}, INTERVAL '1 day') day
    ),
    SELECT date_range.day AS x, COUNT(transactions.id) AS y
    FROM date_range
    LEFT JOIN transactions ON date_range.day = CAST(transactions.date_block AS date)
    AND transactions.success = true 
    GROUP BY date_range.day
    ORDER BY date_range.day`;
        return result as { x: Date; y: bigint }[];
      }
    }),
});
