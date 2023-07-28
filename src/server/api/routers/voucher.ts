import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
import { createPublicClient, createWalletClient, http, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { z } from "zod";
import { abi } from "~/contracts/erc20-token-index/contract";
import { env } from "~/env.mjs";
import { getViemChain } from "~/lib/web3";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
  staffProcedure,
} from "~/server/api/trpc";

const insertVoucherInput = z.object({
  demurrageRate: z.number(),
  periodMinutes: z.number(),
  geo: z.object({
    x: z.number(),
    y: z.number(),
  }),
  locationName: z.string(),
  sinkAddress: z
    .string()
    .refine(isAddress, { message: "Invalid address format" }),
  supply: z.number(),
  symbol: z.string(),
  voucherAddress: z
    .string()
    .refine(isAddress, { message: "Invalid address format" }),
  voucherName: z.string(),
  voucherDescription: z.string(),
});
const updateVoucherInput = z.object({
  geo: z.object({
    x: z.number(),
    y: z.number(),
  }),
  locationName: z.string(),
  voucherAddress: z
    .string()
    .refine(isAddress, { message: "Invalid address format" }),
  voucherDescription: z.string(),
});
export type UpdateVoucherInput = z.infer<typeof updateVoucherInput>;

export type DeployVoucherInput = z.infer<typeof insertVoucherInput>;
export const voucherRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }) => {
    return ctx.kysely.selectFrom("vouchers").selectAll().execute();
  }),
  byAddress: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const voucher = await ctx.kysely
        .selectFrom("vouchers")
        .select([
          "id",
          "voucher_address",
          "voucher_name",
          "voucher_description",
          "supply",
          "geo",
          "demurrage_rate",
          "location_name",
          "sink_address",
          "symbol",
        ])
        .where("voucher_address", "=", input.voucherAddress)
        .executeTakeFirst();
      return voucher;
    }),
  holders: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.kysely
        .selectFrom("transactions")
        .innerJoin(
          "accounts",
          "transactions.recipient_address",
          "accounts.blockchain_address"
        )
        .distinctOn("transactions.recipient_address")
        .where("transactions.voucher_address", "=", input.voucherAddress)
        .select(["accounts.created_at", "blockchain_address as address"])
        .execute();
    }),
  deploy: adminProcedure
    .input(insertVoucherInput)
    .mutation(async ({ ctx, input }) => {
      // await opts.ctx.prisma.writeContract({
      const account = privateKeyToAccount(
        env.TOKEN_INDEX_WRITER_PRIVATE_KEY as `0x${string}`
      );
      const chain = getViemChain();
      // Initialize clients
      const client = createWalletClient({
        account,
        chain: chain,
        transport: http(),
      });
      const publicClient = createPublicClient({
        chain: chain,
        transport: http(),
      });

      // Write contract and get receipt
      console.log({
        address: env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS,
        functionName: "add",
        args: [input.voucherAddress],
      });
      try {
        const hash = await client.writeContract({
          abi: abi,
          address: env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS,
          functionName: "add",
          args: [input.voucherAddress],
        });
        console.log({ hash });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status == "reverted") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to write to Token Index: Transaction ${hash} on ${
              getViemChain().name
            } was Reverted`,
          });
        }
      } catch (error) {
        console.error(
          "Failed to write contract or get transaction receipt:",
          error
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to write to Token Index: Transaction`,
          cause: error,
        });
      }
      const voucher = await ctx.kysely
        .insertInto("vouchers")
        .values({
          active: true,
          geo: input.geo,
          demurrage_rate: input.demurrageRate,
          location_name: input.locationName,
          sink_address: input.sinkAddress,
          supply: input.supply || 10,
          symbol: input.symbol,
          voucher_name: input.voucherName,
          voucher_description: input.voucherDescription,
          voucher_address: input.voucherAddress,
        })
        .returningAll()
        .executeTakeFirst()
        .catch((error) => {
          console.error("Failed to insert voucher:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to add voucher to graph`,
            cause: error,
          });
        });
      return voucher;
    }),
  update: staffProcedure
    .input(updateVoucherInput)
    .mutation(async ({ ctx, input }) => {
      const voucher = await ctx.kysely
        .updateTable("vouchers")
        .set({
          geo: input.geo,
          location_name: input.locationName,
          voucher_description: input.voucherDescription,
        })
        .where("voucher_address", "=", input.voucherAddress)
        .returningAll()
        .executeTakeFirst()
        .catch((error) => {
          console.error("Failed to update voucher:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update voucher`,
            cause: error,
          });
        });
      return voucher;
    }),
  registrationsPerDay: publicProcedure.query(async ({ ctx }) => {
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
  `.execute(ctx.kysely);

    return result.rows;
  }),
  monthlyStatsPerVoucher: publicProcedure
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
      const lastPeriod = {
        from: new Date(input.dateRange.from.getTime() - timeDiff),
        to: new Date(input.dateRange.to.getTime() - timeDiff),
      };

      const query = sql<{
        voucher_address: string;
        voucher_name: string;
        this_period_total: number;
        last_period_total: number;
        unique_accounts_this_period: number;
        unique_accounts_last_period: number;
      }>`
    WITH this_period AS (
      SELECT
        voucher_address,
        COUNT(*) AS total_transactions
      FROM
        transactions
      WHERE
        date_block >= ${input.dateRange.from}
        AND date_block < ${input.dateRange.to}

        AND success = true
        AND tx_type = 'TRANSFER'
      GROUP BY
        voucher_address
    ),
    last_period AS (
      SELECT
        voucher_address,
        COUNT(*) AS total_transactions
      FROM
        transactions
      WHERE
        date_block >= ${lastPeriod.from}
        AND date_block < ${lastPeriod.to}
        AND success = true
        AND tx_type = 'TRANSFER'
      GROUP BY
        voucher_address
    )
    SELECT
      v.voucher_address,
      v.voucher_name,
      COALESCE(this_period.total_transactions, 0) AS this_period_total,
      COALESCE(last_period.total_transactions, 0) AS last_period_total,
      COUNT(DISTINCT t.sender_address) AS unique_accounts_this_period,
      COALESCE(lm.unique_accounts_last_period, 0) AS unique_accounts_last_period
    FROM
      vouchers v
    LEFT JOIN
      this_period ON v.voucher_address = this_period.voucher_address
    LEFT JOIN
      last_period ON v.voucher_address = last_period.voucher_address
    LEFT JOIN (
      SELECT
        voucher_address,
        COUNT(DISTINCT sender_address) AS unique_accounts_last_period
      FROM
        transactions
      WHERE
        date_block >= ${lastPeriod.from}
        AND date_block < ${lastPeriod.to}
      GROUP BY
        voucher_address
    ) lm ON v.voucher_address = lm.voucher_address
    LEFT JOIN
      transactions t ON v.voucher_address = t.voucher_address
    GROUP BY
      v.voucher_name,
      v.voucher_address,
      this_period.total_transactions,
      last_period.total_transactions,
      lm.unique_accounts_last_period;
    `;
      const result = await query.execute(ctx.kysely);

      return result.rows;
    }),
  monthlyStats: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const month = sql<Date>`DATE_TRUNC('month', transactions.date_block)`.as(
        "month"
      );
      const volume = sql<bigint>`SUM(transactions.tx_value)`.as("total_volume");
      const uniqueAccounts = sql<number>`COUNT(DISTINCT accounts.id)`.as(
        "unique_accounts"
      );
      const totalTxs = sql<number>`COUNT(transactions.id)`.as(
        `total_transactions`
      );
      let query = ctx.kysely
        .selectFrom("transactions")
        .select([month, volume, uniqueAccounts, totalTxs])
        .innerJoin("accounts", "accounts.blockchain_address", "sender_address")
        .where("transactions.date_block", ">=", sql`NOW() - INTERVAL '2 month'`)
        .where("transactions.tx_type", "=", "TRANSFER")
        .where("transactions.success", "=", true)
        .groupBy("month")
        .orderBy("month", "desc");
      if (input.voucherAddress) {
        query = query.where(
          "transactions.voucher_address",
          "=",
          input.voucherAddress
        );
      }
      const result = await query.execute();
      const [current, previous] = result;
      const data = {
        month: current?.month,
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
  volumePerDay: publicProcedure
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
  `.execute(ctx.kysely);
      return result.rows;
    }),
});
