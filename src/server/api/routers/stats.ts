/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { sql } from "kysely";
import { getAddress } from "viem";
import { z } from "zod";
import { CUSD_TOKEN_ADDRESS } from "~/lib/contacts";
import { publicProcedure, router } from "~/server/api/trpc";

export const statsRouter = router({
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
      try {
        const from = input.dateRange?.from ?? new Date("2023-06-01");
        const to = input.dateRange?.to ?? new Date();

        let subquery = ctx.federatedDB
          .selectFrom("chain_data.token_transfer")
          .select([
            sql<Date>`DATE(chain_data.tx.date_block)`.as("date"),
            "chain_data.token_transfer.tx_id",
          ])
          .innerJoin("chain_data.tx", "chain_data.tx.id", "chain_data.token_transfer.tx_id")
          .where("chain_data.tx.date_block", ">=", from)
          .where("chain_data.tx.date_block", "<=", to)
          .where("chain_data.tx.success", "=", true)
          .where("chain_data.token_transfer.contract_address", "!=", CUSD_TOKEN_ADDRESS);
        if (input.voucherAddress) {
          subquery = subquery.where(
            "chain_data.token_transfer.contract_address",
            "=",
            getAddress(input.voucherAddress)
          );
        }

        const result = await ctx.federatedDB
          .selectFrom(subquery.as("subq"))
          .select([
            "subq.date as x",
            sql<string>`COUNT(DISTINCT subq.tx_id)`.as("y"),
          ])
          .groupBy("subq.date")
          .orderBy("subq.date")
          .execute();

        if (result.length === 0) {
          console.log("No results found for the given criteria");
          return [];
        }
        return result;
      } catch (error) {
        console.error("Error in txsPerDay query:", error);
        throw error;
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

      const thisPeriod = ctx.federatedDB
        .selectFrom("chain_data.token_transfer")
        .innerJoin("chain_data.tx", "chain_data.tx.id", "chain_data.token_transfer.tx_id")
        .select([
          "chain_data.token_transfer.contract_address as voucher_address",
          ctx.federatedDB.fn.countAll().as("total_transactions"),
          sql<number>`COUNT(DISTINCT chain_data.token_transfer.sender_address)`.as(
            "unique_accounts"
          ),
        ])
        .where("chain_data.tx.date_block", ">=", input.dateRange.from)
        .where("chain_data.tx.date_block", "<", input.dateRange.to)
        .where("chain_data.tx.success", "=", true)
        .where("chain_data.token_transfer.contract_address", "!=", CUSD_TOKEN_ADDRESS)
        .groupBy("chain_data.token_transfer.contract_address")
        .as("this_period");

      const lastPeriod = ctx.federatedDB
        .selectFrom("chain_data.token_transfer")
        .innerJoin("chain_data.tx", "chain_data.tx.id", "chain_data.token_transfer.tx_id")
        .select([
          "chain_data.token_transfer.contract_address as voucher_address",
          ctx.federatedDB.fn.countAll().as("total_transactions"),
          sql<number>`COUNT(DISTINCT chain_data.token_transfer.sender_address)`.as(
            "unique_accounts"
          ),
        ])
        .where("chain_data.tx.date_block", ">=", last.from)
        .where("chain_data.tx.date_block", "<", last.to)
        .where("chain_data.tx.success", "=", true)
        .where("chain_data.token_transfer.contract_address", "!=", CUSD_TOKEN_ADDRESS)
        .groupBy("chain_data.token_transfer.contract_address")
        .as("last_period");

      const query = ctx.federatedDB
        .selectFrom("chain_data.tokens as t")
        .leftJoin(
          thisPeriod,
          "this_period.voucher_address",
          "t.contract_address"
        )
        .leftJoin(
          lastPeriod,
          "last_period.voucher_address",
          "t.contract_address"
        )
        .select([
          "t.contract_address as voucher_address",
          "t.token_name as voucher_name",
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

      // Fetch report counts separately from graphDB
      let reportCounts: Record<string, number> = {};
      try {
        const reportCountsResult = await ctx.graphDB
          .selectFrom("field_reports")
          .select([
            sql<string>`unnest(vouchers)`.as("voucher_address"),
            sql<number>`COUNT(*)`.as("total_reports"),
          ])
          .where("status", "=", "APPROVED")
          .groupBy(sql`unnest(vouchers)`)
          .execute();

        reportCounts = reportCountsResult.reduce((acc, row) => {
          acc[row.voucher_address] = row.total_reports;
          return acc;
        }, {} as Record<string, number>);
      } catch (error) {
        console.warn("Error fetching report counts:", error);
        // Continue without report counts if there's an error
      }

      // Merge report counts with the main results
      return result.map((row) => ({
        ...row,
        total_reports: reportCounts[row.voucher_address] || 0,
      }));
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

      const period = sql<"current" | "previous" | "outside">`CASE
        WHEN tx.date_block >= ${input.dateRange.from} AND tx.date_block < ${input.dateRange.to} THEN 'current'
        WHEN tx.date_block >= ${lastPeriod.from} AND tx.date_block < ${lastPeriod.to} THEN 'previous'
        ELSE 'outside'
      END`.as("period");

      const volume = sql<string>`SUM(token_transfer.transfer_value)`.as(
        "total_volume"
      );
      const uniqueAccounts =
        sql<number>`COUNT(DISTINCT token_transfer.sender_address)`.as(
          "unique_accounts"
        );
      const totalTxs = sql<number>`COUNT(DISTINCT token_transfer.tx_id)`.as(
        "total_transactions"
      );

      let query = ctx.federatedDB
        .selectFrom("chain_data.token_transfer")
        .innerJoin("chain_data.tx", "chain_data.tx.id", "chain_data.token_transfer.tx_id")
        .select([period, volume, uniqueAccounts, totalTxs])
        .where("chain_data.tx.date_block", ">=", lastPeriod.from)
        .where("chain_data.tx.date_block", "<=", input.dateRange.to)
        .where("chain_data.tx.success", "=", true)
        .groupBy("period");

      if (input.voucherAddress) {
        query = query.where(
          "chain_data.token_transfer.contract_address",
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
          total: BigInt(current?.total_volume ?? "0"),
          delta:
            BigInt(current?.total_volume ?? "0") -
            BigInt(previous?.total_volume ?? "0"),
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
          COALESCE(SUM(chain_data.token_transfer.transfer_value), '0') AS y
        FROM
          date_range
        LEFT JOIN chain_data.tx ON date_range.day = CAST(chain_data.tx.date_block AS date)
        LEFT JOIN chain_data.token_transfer ON chain_data.tx.id = chain_data.token_transfer.tx_id
        WHERE
          chain_data.token_transfer.contract_address = ${input.voucherAddress}
        GROUP BY
          date_range.day
        ORDER BY
          date_range.day;
      `.execute(ctx.federatedDB);

      return result.rows;
    }),

  poolStats: publicProcedure
    .input(
      z.object({
        dateRange: z.object({
          from: z.date(),
          to: z.date(),
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const { from, to } = input.dateRange;

      const totalPools = await ctx.graphDB
        .selectFrom("swap_pools")
        .select(sql<number>`count(*)`.as("count"))
        .executeTakeFirst();

      const activePools = await ctx.federatedDB
        .selectFrom("chain_data.pool_swap")
        .select(sql<number>`count(distinct contract_address)`.as("count"))
        .innerJoin("chain_data.tx", "chain_data.tx.id", "chain_data.pool_swap.tx_id")
        .where("chain_data.tx.date_block", ">=", from)
        .where("chain_data.tx.date_block", "<=", to)
        .executeTakeFirst();

      const totalLiquidity = await ctx.federatedDB
        .selectFrom("chain_data.pool_deposit")
        .select(sql<string>`sum(in_value)`.as("total_liquidity"))
        .innerJoin("chain_data.tx", "chain_data.tx.id", "chain_data.pool_deposit.tx_id")
        .where("chain_data.tx.date_block", "<=", to)
        .executeTakeFirst();

      const totalVolume = await ctx.federatedDB
        .selectFrom("chain_data.pool_swap")
        .select(sql<string>`sum(in_value)`.as("total_volume"))
        .innerJoin("chain_data.tx", "chain_data.tx.id", "chain_data.pool_swap.tx_id")
        .where("chain_data.tx.date_block", ">=", from)
        .where("chain_data.tx.date_block", "<=", to)
        .executeTakeFirst();

      return {
        totalPools: totalPools?.count ?? 0,
        activePools: activePools?.count ?? 0,
        totalLiquidity: parseFloat(totalLiquidity?.total_liquidity ?? "0"),
        totalVolume: parseFloat(totalVolume?.total_volume ?? "0"),
      };
    }),
});
