/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { sql } from "kysely";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const statsRouter = createTRPCRouter({
  userRegistrationsPerDay: publicProcedure.query(async ({ ctx }) => {
    const start = new Date("2022-07-01");
    const end = new Date();
    // https://kyse.link/?p=s&i=jQqyhnUqaVR3ZQvJj0W8
    const result = await sql<{ x: Date; y: string }>`
    WITH date_range AS (
      SELECT day::date
      FROM generate_series(${start}, ${end}, INTERVAL '1 day') day
    )
    SELECT
      date_range.day AS x,
      COUNT(users.id) AS y
    FROM
      date_range
      LEFT JOIN users ON date_range.day = CAST(users.created_at AS date)
    GROUP BY
      date_range.day
    ORDER BY
      date_range.day;
  `.execute(ctx.graphDB);

    return result.rows;
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
    ORDER BY date_range.day`.execute(ctx.graphDB);
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
    ORDER BY date_range.day`.execute(ctx.graphDB);
        return result.rows;
      }
    }),

  statsPerVoucher: publicProcedure
    .input(
      z.object({
        dateRange: z.object({
          from: z.date(),
          to: z.date(),
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const timeDiff =
        input.dateRange.to.getTime() - input.dateRange.from.getTime();
      const last = {
        from: new Date(input.dateRange.from.getTime() - timeDiff),
        to: new Date(input.dateRange.to.getTime() - timeDiff),
      };
      const thisPeriod = ctx.graphDB
        .selectFrom("transactions")
        .select([
          "voucher_address",
          ctx.graphDB.fn.countAll().as("total_transactions"),
          ctx.graphDB.fn
            .count("sender_address")
            .distinct()
            .as("unique_accounts"),
        ])
        .where("date_block", ">=", input.dateRange.from)
        .where("date_block", "<", input.dateRange.to)
        .where("success", "=", true)
        .where("tx_type", "=", "TRANSFER")
        .groupBy("voucher_address")
        .as("this_period");

      const lastPeriod = ctx.graphDB
        .selectFrom("transactions")
        .select([
          "voucher_address",
          ctx.graphDB.fn.countAll().as("total_transactions"),
          ctx.graphDB.fn
            .count("sender_address")
            .distinct()
            .as("unique_accounts"),
        ])
        .where("date_block", ">=", last.from)
        .where("date_block", "<", last.to)
        .where("success", "=", true)
        .where("tx_type", "=", "TRANSFER")
        .groupBy("voucher_address")
        .as("last_period");

      const query = ctx.graphDB
        .selectFrom("vouchers as v")
        .leftJoin(
          thisPeriod,
          "this_period.voucher_address",
          "v.voucher_address"
        )
        .leftJoin(
          lastPeriod,
          "last_period.voucher_address",
          "v.voucher_address"
        )
        .select([
          "v.voucher_address",
          "v.voucher_name",
          sql<number>`COALESCE(this_period.total_transactions, 0)`.as(
            "this_period_total"
          ),
          sql<number>`COALESCE(last_period.total_transactions, 0)`.as(
            "last_period_total"
          ),
          sql<number>`COALESCE(this_period.unique_accounts, 0)`.as(
            "unique_accounts_this_period"
          ),
          sql<number>`COALESCE(last_period.unique_accounts, 0)`.as(
            "unique_accounts_last_period"
          ),
        ]);
      const result = await query.execute();

      return result;
    }),
  voucherStats: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string().optional(),
        dateRange: z.object({
          from: z.date(),
          to: z.date(),
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const timeDiff =
        input.dateRange.to.getTime() - input.dateRange.from.getTime();
      const lastPeriod = {
        from: new Date(input.dateRange.from.getTime() - timeDiff),
        to: new Date(input.dateRange.to.getTime() - timeDiff),
      };
      const period = sql<"current" | "outside" | "previous">`CASE
        WHEN date_block >= ${input.dateRange.from} AND date_block < ${input.dateRange.to} THEN 'current'
        WHEN date_block >= ${lastPeriod.from} AND date_block < ${lastPeriod.to} THEN 'previous'
        ELSE 'outside'
    END`.as("period");
      const volume = sql<bigint>`SUM(transactions.tx_value)`.as("total_volume");
      const uniqueAccounts = sql<number>`COUNT(DISTINCT accounts.id)`.as(
        "unique_accounts"
      );
      const totalTxs = sql<number>`COUNT(transactions.id)`.as(
        `total_transactions`
      );
      let query = ctx.graphDB
        .selectFrom("transactions")
        .select([period, volume, uniqueAccounts, totalTxs])
        .innerJoin("accounts", "accounts.blockchain_address", "sender_address")
        .where("transactions.date_block", ">=", lastPeriod.from)
        .where("transactions.date_block", "<=", input.dateRange.to)
        .where("transactions.tx_type", "=", "TRANSFER")
        .where("transactions.success", "=", true)
        .groupBy("period");
      if (input.voucherAddress) {
        query = query.where(
          "transactions.voucher_address",
          "=",
          input.voucherAddress
        );
      }
      const result = await query.execute();
      const current = result.find((row) => row.period === "current");
      const previous = result.find((row) => row.period === "previous");
      const data = {
        period: "current",
        volume: {
          total: current?.total_volume ?? BigInt(0),
          delta:
            parseInt(current?.total_volume?.toString() ?? "0") -
            parseInt(previous?.total_volume?.toString() ?? "0"),
        },
        accounts: {
          total: current?.unique_accounts ?? 0,
          delta:
            (current?.unique_accounts ?? 0) - (previous?.unique_accounts ?? 0),
        },
        transactions: {
          total: current?.total_transactions ?? 0,
          delta:
            (current?.total_transactions ?? 0) -
            (previous?.total_transactions ?? 0),
        },
      };

      return data;
    }),
  voucherVolumePerDay: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const start = new Date("2022-07-01");
      const end = new Date();
      const result = await sql<{ x: Date; y: string }>`
      WITH date_range AS (
        SELECT day::date
        FROM generate_series(${start}, ${end}, INTERVAL '1 day') day
      )
      SELECT
        date_range.day AS x,
        SUM(transactions.tx_value) AS y
      FROM
        date_range
      LEFT JOIN transactions ON date_range.day = CAST(transactions.date_block AS date)   WHERE    transactions.voucher_address = ${input.voucherAddress}
  
      GROUP BY
        date_range.day
      ORDER BY
        date_range.day;
    `.execute(ctx.graphDB);
      return result.rows;
    }),
});
