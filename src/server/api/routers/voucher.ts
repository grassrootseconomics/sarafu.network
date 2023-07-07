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
  decimals: z.number(),
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
  update: adminProcedure
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
  monthlyStats: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await sql<{
        month: Date;
        total_volume: bigint;
        unique_users: number;
        total_transactions: number;
      }>`
    SELECT 
      DATE_TRUNC('month', t.date_block) AS month, 
      SUM(t.tx_value) AS total_volume,
      COUNT(DISTINCT a.user_identifier) as unique_users,
      COUNT(t.id) as total_transactions
    FROM 
        transactions t
    JOIN 
        accounts a ON a.blockchain_address = t.sender_address
    WHERE 
        t.voucher_address = ${input.voucherAddress} 
        AND t.date_block >= NOW() - INTERVAL '2 month'
    GROUP BY 
        month
    ORDER BY 
        month;

  `.execute(ctx.kysely);
      const data = {
        month: result.rows[0]?.month,
        volume: {
          total: result.rows[0]?.total_volume || BigInt(0),
          delta:
            parseInt(result.rows[0]?.total_volume.toString() || "0") -
            parseInt(result.rows[1]?.total_volume.toString() || "0"),
        },
        users: {
          total: result.rows[0]?.unique_users || 0,
          delta:
            (result.rows[0]?.unique_users || 0) -
            (result.rows[1]?.unique_users || 0),
        },
        transactions: {
          total: result.rows[0]?.total_transactions || 0,
          delta:
            (result.rows[0]?.total_transactions || 0) -
            (result.rows[1]?.total_transactions || 0),
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
