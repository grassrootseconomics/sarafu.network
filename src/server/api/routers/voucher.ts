import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
import { isAddress } from "viem";
import { z } from "zod";
import { schemas } from "~/components/voucher/voucher-stepper/schemas";
import { env } from "~/env.mjs";
import {
  adminProcedure,
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
  staffProcedure,
} from "~/server/api/trpc";
import { AccountRoleType, CommodityType, VoucherType } from "~/server/enums";
import { TokenIndex } from "~/server/token-index";

const insertVoucherInput = z.object({
  ...schemas,
  voucherAddress: z
    .string()
    .refine(isAddress, { message: "Invalid address format" }),
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

const tokenIndex = new TokenIndex();

export const voucherRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }) => {
    return ctx.kysely.selectFrom("vouchers").selectAll().execute();
  }),
  remove: adminProcedure
    .input(
      z.object({
        voucherAddress: z.string().refine(isAddress),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const transactionResult = await ctx.kysely
        .transaction()
        .execute(async (trx) => {
          const { voucherAddress } = input;

          const { id, symbol } = await trx
            .selectFrom("vouchers")
            .where("voucher_address", "=", voucherAddress)
            .select(["id", "symbol"])
            .executeTakeFirstOrThrow();

          const address = await tokenIndex.addressOf(symbol);

          if (address !== voucherAddress) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Voucher Address (${voucherAddress}) does not match address (${address}) in the Token Index`,
            });
          }
          await trx
            .deleteFrom("transactions")
            .where("voucher_address", "=", voucherAddress)
            .executeTakeFirstOrThrow();

          await trx
            .deleteFrom("voucher_issuers")
            .where("voucher", "=", id)
            .executeTakeFirstOrThrow();
          await trx
            .deleteFrom("voucher_certifications")
            .where("voucher", "=", id)
            .executeTakeFirstOrThrow();
          await trx
            .deleteFrom("commodity_listings")
            .where("voucher", "=", id)
            .executeTakeFirstOrThrow();
          await trx
            .deleteFrom("vouchers")
            .where("id", "=", id)
            .executeTakeFirstOrThrow();

          await tokenIndex.remove(address);

          return true;
        });

      return transactionResult;
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
          "geo",
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
  deploy: authenticatedProcedure
    .input(insertVoucherInput)
    .mutation(async ({ ctx, input }) => {
      if (input.expiration.type !== "gradual") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Only gradual expiration is supported`,
        });
      }
      const communityFund = input.expiration.communityFund;
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `You must be logged in to deploy a voucher`,
        });
      }
      const internal = ctx.session.user.role === AccountRoleType.ADMIN;
      // Write contract and get receipt
      console.debug({
        address: env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS,
        functionName: "add",
        args: [input.voucherAddress],
      });

      const voucher = await ctx.kysely.transaction().execute(async (trx) => {
        // Create Voucher in DB
        const v = await trx
          .insertInto("vouchers")
          .values({
            symbol: input.nameAndProducts.symbol,
            voucher_name: input.nameAndProducts.name,
            voucher_address: input.voucherAddress,
            voucher_description: input.nameAndProducts.description,
            sink_address: communityFund,
            voucher_email: input.aboutYou.email,
            voucher_value: input.valueAndSupply.value,
            voucher_website: input.aboutYou.website,
            voucher_uoa: input.valueAndSupply.uoa,
            voucher_type: VoucherType.DEMURRAGE,
            geo: input.aboutYou.geo,
            location_name: input.aboutYou.location,
            internal: internal,
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
        if (!v || !v.id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to add voucher to graph`,
          });
        }
        // Add Issuer to DB
        await trx
          .insertInto("voucher_issuers")
          .values({
            voucher: v.id,
            backer: ctx.session!.user!.account.id,
          })
          .returningAll()
          .executeTakeFirst();

        // Add Products to DB
        // Add Products to DB
        if (input.nameAndProducts.products) {
          await trx
            .insertInto("commodity_listings")
            .values(
              input.nameAndProducts.products.map((product) => ({
                commodity_name: product.name,
                commodity_description: product.description,
                commodity_type: CommodityType.GOOD,
                voucher: v.id,
                quantity: product.quantity,
                location_name: input.aboutYou.location,
                frequency: product.frequency,
                account: ctx.session!.user!.account.id,
              }))
            )
            .returningAll()
            .execute();
        }
        // Add Voucher to Token Index Contract
        try {
          const receipt = await tokenIndex.add(input.voucherAddress);

          if (receipt.status == "reverted") {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Transaction Reverted`,
            });
          }
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to write to Token Index`,
            cause: error,
          });
        }
        return v;
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
  stats: publicProcedure
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
      let query = ctx.kysely
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
