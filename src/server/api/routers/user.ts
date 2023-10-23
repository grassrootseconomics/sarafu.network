/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { sql } from "kysely";
import { isAddress } from "viem";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  registrationsPerDay: publicProcedure.query(async ({ ctx }) => {
    const start = new Date("2022-07-01");
    const end = new Date();

    const result = await sql`WITH date_range AS (
      SELECT day::date
      FROM generate_series(${start}, ${end}, INTERVAL '1 day') day
    )
    SELECT
      date_range.day AS x,
      COUNT(users.id) AS y
    FROM
      date_range
      LEFT JOIN users ON date_range.day = CAST(users.date_registered AS date)
    GROUP BY
      date_range.day
    ORDER BY
      date_range.day;`.execute(ctx.kysely);

    return result;
  }),

  vouchers: authenticatedProcedure.query(async ({ ctx }) => {
    const address = ctx.session?.user?.account.blockchain_address;
    if (!address || !isAddress(address)) {
      return [];
    }
    const result = await ctx.kysely
    .selectFrom('vouchers')
    .selectAll()
    .where(
      'voucher_address',
      'in',
      ctx.kysely
        .selectFrom('transactions')
        .select('voucher_address')
        .where((eb) =>
          eb.or([
            eb('sender_address', '=', address),
            eb('recipient_address', '=', address),
          ])
        )
        .distinct()
    )
    .execute();

  return result;

    return result; // rows cont rows contain the queried results
  }),
});
