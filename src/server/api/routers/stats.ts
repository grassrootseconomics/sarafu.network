/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { sql } from "kysely";
import { getAddress } from "viem";
import { z } from "zod";
import { CUSD_TOKEN_ADDRESS } from "~/lib/contacts";
import { publicProcedure, router } from "~/server/api/trpc";
import { cacheQuery } from "~/utils/cache/cacheQuery";
import { normalizeDateRange } from "~/utils/units/date";
import { normalizedDateRangeSchema } from "~/utils/zod";
export const statsRouter = router({
  txsPerDay: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string().optional(),
        dateRange: normalizedDateRangeSchema.optional(),
      })
    )
    .query(
      cacheQuery(3600, async ({ ctx, input }) => {
        try {
          // Defaults if not provided
          const defaultFrom = new Date();
          defaultFrom.setMonth(defaultFrom.getMonth() - 1); // 1 Month
          const defaultTo = new Date();

          // Use normalized date range from schema or apply defaults with normalization
          const { from, to } =
            input.dateRange ?? normalizeDateRange(defaultFrom, defaultTo);

          // Optimized: Filter tx table first to force pushdown, then join
          const txSubquery = ctx.federatedDB
            .selectFrom("chain_data.tx")
            .select([
              "id",
              sql<string>`DATE(date_block AT TIME ZONE 'Africa/Nairobi')`.as(
                "local_date"
              ),
            ])
            .where("chain_data.tx.date_block", ">=", from)
            .where("chain_data.tx.date_block", "<=", to)
            .where("chain_data.tx.success", "=", true)
            .as("filtered_tx");

          const subquery = ctx.federatedDB
            .selectFrom("chain_data.token_transfer")
            .innerJoin(
              txSubquery,
              "filtered_tx.id",
              "chain_data.token_transfer.tx_id"
            )
            .$if(!!input.voucherAddress, (qb) => {
              // Use checksummed address for exact match (allows index usage)
              const checksummed = getAddress(input.voucherAddress!);
              return qb.where(
                "chain_data.token_transfer.contract_address",
                "=",
                checksummed
              );
            })
            .$if(!input.voucherAddress, (qb) => {
              // Exclude cUSD using checksummed address
              return qb.where(
                "chain_data.token_transfer.contract_address",
                "!=",
                CUSD_TOKEN_ADDRESS
              );
            })
            .select([
              sql<string>`filtered_tx.local_date`.as("local_date"),
            ])
            .as("transfers_with_date");

          // Aggregate on the pre-processed dates (much faster)
          const result = await ctx.federatedDB
            .selectFrom(subquery)
            .select([
              sql<Date>`local_date`.as("x"),
              sql<bigint>`COUNT(*)`.as("y"),
            ])
            .groupBy("local_date")
            .orderBy("local_date", "asc")
            .execute();

          return result; // [{ x: Date, y: number }, ...]
        } catch (error) {
          console.error("Error in txsPerDay query:", error);
          throw error;
        }
      })
    ),

  statsPerVoucher: publicProcedure
    .input(
      z.object({
        dateRange: normalizedDateRangeSchema,
      })
    )
    .query(
      cacheQuery(3600, async ({ ctx, input }) => {
        // Date range is already normalized by schema
        const normalized = input.dateRange;

        const timeDiff = normalized.to.getTime() - normalized.from.getTime();
        const last = {
          from: new Date(normalized.from.getTime() - timeDiff),
          to: new Date(normalized.to.getTime() - timeDiff),
        };

        // Optimized: Use subqueries to force filter pushdown
        // Filter tx table first, then join with token_transfer
        const currentTxSubquery = ctx.federatedDB
          .selectFrom("chain_data.tx")
          .select("id")
          .where("chain_data.tx.date_block", ">=", normalized.from)
          .where("chain_data.tx.date_block", "<=", normalized.to)
          .where("chain_data.tx.success", "=", true)
          .as("current_tx");

        const lastTxSubquery = ctx.federatedDB
          .selectFrom("chain_data.tx")
          .select("id")
          .where("chain_data.tx.date_block", ">=", last.from)
          .where("chain_data.tx.date_block", "<=", last.to)
          .where("chain_data.tx.success", "=", true)
          .as("last_tx");

        const [currentPeriodStats, lastPeriodStats, tokens] = await Promise.all(
          [
            // Current period stats
            ctx.federatedDB
              .selectFrom("chain_data.token_transfer")
              .innerJoin(
                currentTxSubquery,
                "current_tx.id",
                "chain_data.token_transfer.tx_id"
              )
              .select([
                "chain_data.token_transfer.contract_address as voucher_address",
                ctx.federatedDB.fn.countAll().as("total_transactions"),
                sql<number>`COUNT(DISTINCT chain_data.token_transfer.sender_address)`.as(
                  "unique_accounts"
                ),
              ])
              .where(
                "chain_data.token_transfer.contract_address",
                "!=",
                CUSD_TOKEN_ADDRESS
              )
              .groupBy("chain_data.token_transfer.contract_address")
              .execute(),
            // Last period stats
            ctx.federatedDB
              .selectFrom("chain_data.token_transfer")
              .innerJoin(
                lastTxSubquery,
                "last_tx.id",
                "chain_data.token_transfer.tx_id"
              )
              .select([
                "chain_data.token_transfer.contract_address as voucher_address",
                ctx.federatedDB.fn.countAll().as("total_transactions"),
                sql<number>`COUNT(DISTINCT chain_data.token_transfer.sender_address)`.as(
                  "unique_accounts"
                ),
              ])
              .where(
                "chain_data.token_transfer.contract_address",
                "!=",
                CUSD_TOKEN_ADDRESS
              )
              .groupBy("chain_data.token_transfer.contract_address")
              .execute(),
            // Token details
            ctx.federatedDB
              .selectFrom("chain_data.tokens")
              .select(["contract_address", "token_name"])
              .execute(),
          ]
        );

        // Build lookup maps for faster merging
        const currentMap = new Map(
          currentPeriodStats.map((s) => [s.voucher_address, s])
        );
        const lastMap = new Map(
          lastPeriodStats.map((s) => [s.voucher_address, s])
        );

        // Merge all data
        const result = tokens.map((token) => {
          const current = currentMap.get(token.contract_address);
          const last = lastMap.get(token.contract_address);
          return {
            voucher_address: token.contract_address,
            voucher_name: token.token_name,
            this_period_total: current ? Number(current.total_transactions) : 0,
            last_period_total: last ? Number(last.total_transactions) : 0,
            unique_accounts_this_period: current?.unique_accounts ?? 0,
            unique_accounts_last_period: last?.unique_accounts ?? 0,
          };
        });

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
      })
    ),
  voucherStats: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string().optional(),
        dateRange: normalizedDateRangeSchema,
      })
    )
    .query(
      cacheQuery(3600, async ({ ctx, input }) => {
        // Date range is already normalized by schema
        const normalized = input.dateRange;

        const timeDiff = normalized.to.getTime() - normalized.from.getTime();
        const lastPeriod = {
          from: new Date(normalized.from.getTime() - timeDiff),
          to: new Date(normalized.to.getTime() - timeDiff),
        };

        // Build base query function to avoid repetition
        const buildPeriodQuery = (from: Date, to: Date) => {
          // Use subquery to force filter pushdown on tx table first
          const txSubquery = ctx.federatedDB
            .selectFrom("chain_data.tx")
            .select(["id", "date_block"])
            .where("chain_data.tx.date_block", ">=", from)
            .where("chain_data.tx.date_block", "<=", to)
            .where("chain_data.tx.success", "=", true)
            .as("filtered_tx");

          let q = ctx.federatedDB
            .selectFrom("chain_data.token_transfer")
            .innerJoin(
              txSubquery,
              "filtered_tx.id",
              "chain_data.token_transfer.tx_id"
            )
            .select([
              sql<string>`SUM(token_transfer.transfer_value)`.as("total_volume"),
              sql<number>`COUNT(DISTINCT token_transfer.sender_address)`.as(
                "unique_accounts"
              ),
              sql<number>`COUNT(*)`.as("total_transfers"),
            ]);

          if (input.voucherAddress) {
            q = q.where(
              "chain_data.token_transfer.contract_address",
              "=",
              input.voucherAddress
            );
          }

          return q;
        };

        // Execute both queries in parallel instead of a single large scan
        const [current, previous] = await Promise.all([
          buildPeriodQuery(normalized.from, normalized.to).executeTakeFirst(),
          buildPeriodQuery(lastPeriod.from, lastPeriod.to).executeTakeFirst(),
        ]);

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
              (current?.unique_accounts ?? 0) -
              (previous?.unique_accounts ?? 0),
          },
          transactions: {
            total: current?.total_transfers ?? 0,
            delta:
              (current?.total_transfers ?? 0) -
              (previous?.total_transfers ?? 0),
          },
        };
        return data;
      })
    ),
  voucherVolumePerDay: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string(),
        dateRange: normalizedDateRangeSchema,
      })
    )
    .query(
      cacheQuery(3600, async ({ ctx, input }) => {
        // Date range is already normalized by schema
        const { from: start, to: end } = input.dateRange;

        // If you prefer to checksum/normalize first:
        // const addr = getAddress(input.voucherAddress).toLowerCase();
        const addr = input.voucherAddress.toLowerCase();

        const result = await sql<{ x: Date; y: string }>`
      WITH date_range AS (
        -- Generate Nairobi-local calendar days from start to end (inclusive)
        SELECT day::date AS day
        FROM generate_series(
          (${start})::timestamptz AT TIME ZONE 'Africa/Nairobi',
          (${end})::timestamptz AT TIME ZONE 'Africa/Nairobi',
          INTERVAL '1 day'
        ) AS day
      )
      SELECT
        dr.day AS x,
        COALESCE(SUM(tt.transfer_value), 0)::text AS y
      FROM date_range dr
      -- Join tx rows that fall on this Nairobi-local calendar day
      LEFT JOIN chain_data.tx t
        ON ((t.date_block AT TIME ZONE 'Africa/Nairobi')::date = dr.day)
       AND t.date_block >= ${start}::timestamptz
       AND t.date_block <= ${end}::timestamptz
       AND t.success = true
      -- Join transfers for those txs, filtered to the voucher (case-insensitive) *in the JOIN*
      LEFT JOIN chain_data.token_transfer tt
        ON tt.tx_id = t.id
       AND lower(tt.contract_address) = ${addr}
      GROUP BY dr.day
      ORDER BY dr.day;
    `.execute(ctx.federatedDB);

        return result.rows; // [{ x: Date, y: string }, ...]
      })
    ),

  poolStats: publicProcedure
    .input(
      z.object({
        dateRange: normalizedDateRangeSchema,
      })
    )
    .query(
      cacheQuery(3600, async ({ ctx, input }) => {
        // Date range is already normalized by schema
        const { from, to } = input.dateRange;

        const totalPools = await ctx.graphDB
          .selectFrom("swap_pools")
          .select(sql<number>`count(*)`.as("count"))
          .executeTakeFirst();

        // Create filtered tx subqueries to force filter pushdown
        const txRangeSubquery = ctx.federatedDB
          .selectFrom("chain_data.tx")
          .select("id")
          .where("chain_data.tx.date_block", ">=", from)
          .where("chain_data.tx.date_block", "<=", to)
          .as("tx_range");

        const txUpToSubquery = ctx.federatedDB
          .selectFrom("chain_data.tx")
          .select("id")
          .where("chain_data.tx.date_block", "<=", to)
          .as("tx_up_to");

        const activePools = await ctx.federatedDB
          .selectFrom("chain_data.pool_swap")
          .select(sql<number>`count(distinct contract_address)`.as("count"))
          .innerJoin(
            txRangeSubquery,
            "tx_range.id",
            "chain_data.pool_swap.tx_id"
          )
          .executeTakeFirst();

        const totalLiquidity = await ctx.federatedDB
          .selectFrom("chain_data.pool_deposit")
          .select(sql<string>`sum(in_value)`.as("total_liquidity"))
          .innerJoin(
            txUpToSubquery,
            "tx_up_to.id",
            "chain_data.pool_deposit.tx_id"
          )
          .executeTakeFirst();

        const totalVolume = await ctx.federatedDB
          .selectFrom("chain_data.pool_swap")
          .select(sql<string>`sum(in_value)`.as("total_volume"))
          .innerJoin(
            txRangeSubquery,
            "tx_range.id",
            "chain_data.pool_swap.tx_id"
          )
          .executeTakeFirst();

        return {
          totalPools: totalPools?.count ?? 0,
          activePools: activePools?.count ?? 0,
          totalLiquidity: parseFloat(totalLiquidity?.total_liquidity ?? "0"),
          totalVolume: parseFloat(totalVolume?.total_volume ?? "0"),
        };
      })
    ),
});
