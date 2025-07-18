import { TRPCError } from "@trpc/server";
import { sql, type Kysely } from "kysely";
import { formatUnits, getAddress, isAddress } from "viem";
import { z } from "zod";
import { getMultipleVoucherDetails } from "~/components/pools/contract-functions";
import { publicClient } from "~/config/viem.config.server";
import { PoolIndex } from "~/contracts";
import { getIsContractOwner } from "~/contracts/helpers";
import { deployPool, OTXType, waitForDeployment } from "~/lib/sarafu/custodial";
import {
  authenticatedProcedure,
  publicProcedure,
  router,
} from "~/server/api/trpc";
import { type FederatedDB, type GraphDB } from "~/server/db";
import { sendNewPoolEmbed } from "~/server/discord";
import { hasPermission } from "~/utils/permissions";
import { TagModel } from "../models/tag";
import { getTokenDetails, type TokenDetails } from "../models/token";

export type GeneratorYieldType = {
  message: string;
  status: "loading" | "success" | "error";
  address?: `0x${string}`;
  error?: string;
};

export type InferAsyncGenerator<Gen> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Gen extends AsyncGenerator<infer T, any, any> ? T : never;

async function savePoolToDatabase(
  poolAddress: `0x${string}`,
  input: {
    description: string;
    banner_url?: string;
    tags?: string[];
  },
  ctx: { graphDB: Kysely<GraphDB> }
): Promise<void> {
  const tagModel = new TagModel(ctx.graphDB);
  const db_pool = await ctx.graphDB
    .insertInto("swap_pools")
    .values({
      pool_address: poolAddress,
      swap_pool_description: input.description,
      banner_url: input.banner_url,
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  // Do not fail if tags are not added
  try {
    if (input.tags && input.tags.length > 0) {
      await tagModel.updatePoolTags(db_pool.id, input.tags);
    }
  } catch (error) {
    console.error("Error adding tags to pool:", error);
  }
}

// Add types for the yields
export const poolRouter = router({
  create: authenticatedProcedure
    .input(
      z.object({
        name: z.string(),
        symbol: z.string(),
        decimals: z.number(),
        description: z.string(),
        banner_url: z.string().url().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async function* ({
      ctx,
      input,
    }): AsyncGenerator<GeneratorYieldType> {
      try {
        const userAddress = getAddress(ctx.session.address);
        yield { message: "1/4 - Deploying Contracts", status: "loading" };
        const poolDeployRequest = {
          name: input.name,
          owner: userAddress,
          symbol: input.symbol,
        };
        const poolDeployResponse = await deployPool(poolDeployRequest);

        yield {
          message: "2/4 - Waiting for deployment confirmation",
          status: "loading",
        };

        const swapPool = await waitForDeployment(
          poolDeployResponse.result.trackingId,
          OTXType.SWAPPOOL_DEPLOY
        );
        yield { message: "3/4 - Saving pool to database", status: "loading" };

        await savePoolToDatabase(swapPool.address, input, ctx);

        yield {
          message: "4/4 - Pool successfully deployed!",
          status: "success",
          address: swapPool.address,
        };

        await sendNewPoolEmbed(swapPool.address);
      } catch (error) {
        console.error("Error during pool creation:", error);
        yield {
          message: "Error",
          error: (error as Error).message,
          status: "error",
        };
      }
    }),
  list: publicProcedure
    .input(
      z.object({
        sortBy: z.enum(["swaps", "name", "vouchers"]).default("swaps"),
        sortDirection: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      // Create subqueries separately to avoid TypeScript inference issues
      const swapStatsSubquery = ctx.federatedDB
        .selectFrom("chain_data.pool_swap")
        .select(["contract_address", sql<number>`COUNT(*)`.as("swap_count")])
        .groupBy("contract_address")
        .as("swap_stats");

      const voucherStatsSubquery = ctx.federatedDB
        .selectFrom("pool_router.pool_allowed_tokens")
        .select([
          "pool_address",
          sql<number>`COUNT(DISTINCT token_address)`.as("voucher_count"),
        ])
        .groupBy("pool_address")
        .as("voucher_stats");

      // Single optimized query with all JOINs and database-level sorting
      const pools = await ctx.federatedDB
        .selectFrom("chain_data.pools as p")
        .leftJoin(
          swapStatsSubquery,
          "swap_stats.contract_address",
          "p.contract_address"
        )
        .leftJoin(
          voucherStatsSubquery,
          "voucher_stats.pool_address",
          "p.contract_address"
        )
        .leftJoin(
          "sarafu_network.swap_pools as sp",
          "sp.pool_address",
          "p.contract_address"
        )
        .leftJoin(
          "sarafu_network.swap_pool_tags as spt",
          "spt.swap_pool",
          "sp.id"
        )
        .leftJoin("sarafu_network.tags as t", "t.id", "spt.tag")
        .where("p.removed", "=", false)
        .select([
          "p.contract_address",
          "p.pool_name",
          "p.pool_symbol",
          "sp.swap_pool_description",
          "sp.banner_url",
          sql<number>`COALESCE(swap_stats.swap_count, 0)`.as("swap_count"),
          sql<number>`COALESCE(voucher_stats.voucher_count, 0)`.as(
            "voucher_count"
          ),
          sql<
            string[]
          >`array_agg(DISTINCT t.tag) FILTER (WHERE t.tag IS NOT NULL)`.as(
            "tags"
          ),
        ])
        .groupBy([
          "p.contract_address",
          "p.pool_name",
          "p.pool_symbol",
          "sp.swap_pool_description",
          "sp.banner_url",
          "swap_stats.swap_count",
          "voucher_stats.voucher_count",
        ])
        .orderBy(
          input.sortBy === "swaps"
            ? sql`swap_count`
            : input.sortBy === "vouchers"
            ? sql`voucher_count`
            : "p.pool_name",
          input.sortDirection
        )
        .execute();

      return pools.map((pool) => ({
        contract_address: pool.contract_address,
        pool_name: pool.pool_name,
        pool_symbol: pool.pool_symbol,
        description: pool.swap_pool_description ?? "",
        banner_url: pool.banner_url ?? null,
        tags: pool.tags?.filter(Boolean) ?? [],
        swap_count: pool.swap_count,
        voucher_count: pool.voucher_count,
      }));
    }),
  remove: authenticatedProcedure
    .input(z.string().refine(isAddress))
    .mutation(async ({ ctx, input }) => {
      const pool_address = getAddress(input);
      const isContractOwner = await getIsContractOwner(
        publicClient,
        ctx.session.address,
        pool_address
      );
      const canDelete = hasPermission(
        ctx.user,
        isContractOwner,
        "Pools",
        "DELETE"
      );
      if (!canDelete) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this pool",
        });
      }
      await ctx.graphDB.transaction().execute(async (trx) => {
        const pool = await trx
          .selectFrom("swap_pools")
          .where("pool_address", "=", pool_address)
          .select("id")
          .executeTakeFirst();
        if (pool) {
          await trx
            .deleteFrom("swap_pool_tags")
            .where("swap_pool", "=", pool.id)
            .execute();
          await trx
            .deleteFrom("swap_pools")
            .where("id", "=", pool.id)
            .execute();
        }
        await PoolIndex.remove(pool_address);
      });
      return { message: "Pool removed successfully" };
    }),

  get: publicProcedure
    .input(z.string().refine(getAddress, { message: "Invalid address" }))
    .query(async ({ ctx, input }) => {
      try {
        const pool = await ctx.federatedDB
          .selectFrom("sarafu_network.swap_pools")
          .where("pool_address", "=", input)
          .selectAll()
          .executeTakeFirstOrThrow();

        const tags = await ctx.federatedDB
          .selectFrom("sarafu_network.swap_pool_tags")
          .leftJoin(
            "sarafu_network.tags",
            "sarafu_network.swap_pool_tags.tag",
            "sarafu_network.tags.id"
          )
          .where("sarafu_network.swap_pool_tags.swap_pool", "=", pool.id)
          .select("sarafu_network.tags.tag")
          .execute();

        return {
          ...pool,
          tags: tags.reduce((acc, t) => {
            if (t.tag) {
              acc.push(t.tag);
            }
            return acc;
          }, [] as string[]),
        };
      } catch (error) {
        if ((error as Error).message.includes("no result")) {
          return null;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Pool not found",
        });
      }
    }),
  swaps: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).nullish(),
        cursor: z.number().nullish(),
        address: z.string().refine(isAddress, { message: "Invalid address" }),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const cursor = input.cursor ?? 0;
      const swaps = await ctx.federatedDB
        .selectFrom("chain_data.pool_swap")
        .leftJoin(
          "chain_data.tx",
          "chain_data.tx.id",
          "chain_data.pool_swap.tx_id"
        )
        .where("contract_address", "=", input.address)
        .orderBy("date_block", "desc")
        .selectAll()
        .limit(limit)
        .offset(cursor)
        .execute();
      return {
        swaps,
        nextCursor: swaps.length == limit ? cursor + limit : undefined,
      };
    }),
  deposits: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).nullish(),
        cursor: z.number().nullish(),
        address: z.string().refine(isAddress, { message: "Invalid address" }),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const cursor = input.cursor ?? 0;
      const deposits = await ctx.federatedDB
        .selectFrom("chain_data.pool_deposit")
        .leftJoin(
          "chain_data.tx",
          "chain_data.tx.id",
          "chain_data.pool_deposit.tx_id"
        )
        .where("contract_address", "=", input.address)
        .orderBy("chain_data.tx.date_block", "desc")
        .selectAll()
        .limit(limit)
        .offset(cursor)
        .execute();
      return {
        deposits,
        nextCursor: deposits.length == limit ? cursor + limit : undefined,
      };
    }),
  update: authenticatedProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
        banner_url: z.string().url().optional().nullable(),
        swap_pool_description: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pool_address = getAddress(input.address);
      const isContractOwner = await getIsContractOwner(
        publicClient,
        ctx.session.address,
        pool_address
      );
      const canUpdate = hasPermission(
        ctx.user,
        isContractOwner,
        "Pools",
        "UPDATE"
      );
      if (!canUpdate) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to update this pool",
        });
      }
      let db_pool = await ctx.graphDB
        .updateTable("swap_pools")
        .set({
          banner_url: input.banner_url,
          swap_pool_description: input.swap_pool_description,
        })
        .where("pool_address", "=", pool_address)
        .returning("id")
        .executeTakeFirst();
      if (!db_pool) {
        db_pool = await ctx.graphDB
          .insertInto("swap_pools")
          .values({
            pool_address: pool_address,
            banner_url: input.banner_url,
            swap_pool_description: input.swap_pool_description ?? "",
          })
          .returning("id")
          .executeTakeFirstOrThrow();
      }
      const tagModel = new TagModel(ctx.graphDB);
      if (input.tags && db_pool) {
        await tagModel.updatePoolTags(db_pool.id, input.tags);
      }

      return { message: "Pool updated successfully" };
    }),
  transactions: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).nullish(),
        cursor: z.number().nullish(),
        address: z.string().refine(isAddress, { message: "Invalid address" }),
        type: z.enum(["swap", "deposit", "all"]).nullish(),
        inToken: z
          .string()
          .refine(isAddress, { message: "Invalid address" })
          .nullish(),
        outToken: z
          .string()
          .refine(isAddress, { message: "Invalid address" })
          .nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const cursor = input.cursor ?? 0;
      const type = input.type ?? "all";

      // Subquery for swaps
      const swapsSubquery = ctx.federatedDB
        .selectFrom("chain_data.pool_swap")
        .leftJoin(
          "chain_data.tx",
          "chain_data.tx.id",
          "chain_data.pool_swap.tx_id"
        )
        .where("chain_data.pool_swap.contract_address", "=", input.address)
        .select([
          sql<"swap" | "deposit">`'swap'`.as("type"),
          "chain_data.tx.date_block",
          "chain_data.tx.tx_hash",
          "chain_data.tx.success",
          "chain_data.pool_swap.initiator_address",
          "chain_data.pool_swap.token_in_address",
          "chain_data.pool_swap.token_out_address",
          "chain_data.pool_swap.in_value",
          "chain_data.pool_swap.out_value",
          "chain_data.pool_swap.fee",
        ]);

      // Subquery for deposits, excluding those with tx_ids in swaps
      const depositsSubquery = ctx.federatedDB
        .selectFrom("chain_data.pool_deposit")
        .leftJoin(
          "chain_data.tx",
          "chain_data.tx.id",
          "chain_data.pool_deposit.tx_id"
        )
        .where("chain_data.pool_deposit.contract_address", "=", input.address)

        .select([
          sql<"deposit">`'deposit'`.as("type"),
          "chain_data.tx.date_block",
          "chain_data.tx.tx_hash",
          "chain_data.tx.success",
          "chain_data.pool_deposit.initiator_address",
          "chain_data.pool_deposit.token_in_address",
          sql<string>`NULL`.as("token_out_address"),
          "chain_data.pool_deposit.in_value",
          sql<string>`NULL`.as("out_value"),
          sql<string>`NULL`.as("fee"),
        ]);
      // Subquery for token transfers
      const transfersSubquery = ctx.federatedDB
        .selectFrom("chain_data.token_transfer")
        .leftJoin(
          "chain_data.tx",
          "chain_data.tx.id",
          "chain_data.token_transfer.tx_id"
        )
        .leftJoin(
          "chain_data.pool_swap",
          "chain_data.token_transfer.tx_id",
          "chain_data.pool_swap.tx_id"
        )
        .where(
          "chain_data.token_transfer.recipient_address",
          "=",
          input.address
        )
        .where("chain_data.pool_swap.tx_id", "is", null)
        .select([
          sql<"deposit">`'deposit'`.as("type"),
          "chain_data.tx.date_block",
          "chain_data.tx.tx_hash",
          "chain_data.tx.success",
          "chain_data.token_transfer.sender_address as initiator_address",
          "chain_data.token_transfer.contract_address as token_in_address",
          sql<string>`NULL`.as("token_out_address"),
          "chain_data.token_transfer.transfer_value as in_value",
          sql<string>`NULL`.as("out_value"),
          sql<string>`NULL`.as("fee"),
        ]);

      // Combine all subqueries
      let query = ctx.federatedDB
        .selectFrom(
          swapsSubquery
            .union(depositsSubquery)
            .union(transfersSubquery)
            .as("combined_transactions")
        )
        .select([
          "type",
          "date_block",
          "tx_hash",
          "success",
          "initiator_address",
          "token_in_address",
          "token_out_address",
          "in_value",
          "out_value",
          "fee",
        ]);

      // Apply filters
      if (type !== "all") {
        query = query.where("type", "=", type);
      }
      if (input.inToken) {
        query = query.where("token_in_address", "=", input.inToken);
      }
      if (input.outToken) {
        query = query.where("token_out_address", "=", input.outToken);
      }

      const transactions = await query
        .orderBy("date_block", "desc")
        .limit(limit)
        .offset(cursor)
        .execute();
      return {
        transactions,
        nextCursor: transactions.length === limit ? cursor + limit : undefined,
      };
    }),

  tokenDistribution: publicProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
        from: z.date(),
        to: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const distributionData = await ctx.federatedDB
        .selectFrom((subquery) =>
          subquery
            .selectFrom("chain_data.pool_deposit")
            .innerJoin(
              "chain_data.tx",
              "chain_data.tx.id",
              "chain_data.pool_deposit.tx_id"
            )
            .select([
              "chain_data.pool_deposit.token_in_address as token_address",
              sql<string>`SUM(chain_data.pool_deposit.in_value)`.as(
                "deposit_value"
              ),
              sql<string>`0`.as("swap_in_value"),
              sql<string>`0`.as("swap_out_value"),
            ])
            .where(
              "chain_data.pool_deposit.contract_address",
              "=",
              input.address
            )
            .where("chain_data.tx.date_block", ">=", input.from)
            .where("chain_data.tx.date_block", "<=", input.to)
            .groupBy("chain_data.pool_deposit.token_in_address")
            .union(
              subquery
                .selectFrom("chain_data.pool_swap")
                .innerJoin(
                  "chain_data.tx",
                  "chain_data.tx.id",
                  "chain_data.pool_swap.tx_id"
                )
                .select([
                  "chain_data.pool_swap.token_in_address as token_address",
                  sql<string>`0`.as("deposit_value"),
                  sql<string>`SUM(pool_swap.in_value)`.as("swap_in_value"),
                  sql<string>`0`.as("swap_out_value"),
                ])
                .where(
                  "chain_data.pool_swap.contract_address",
                  "=",
                  input.address
                )
                .where("chain_data.tx.date_block", ">=", input.from)
                .where("chain_data.tx.date_block", "<=", input.to)
                .groupBy("chain_data.pool_swap.token_in_address")
            )
            .union(
              subquery
                .selectFrom("chain_data.pool_swap")
                .innerJoin(
                  "chain_data.tx",
                  "chain_data.tx.id",
                  "chain_data.pool_swap.tx_id"
                )
                .select([
                  "chain_data.pool_swap.token_out_address as token_address",
                  sql<string>`0`.as("deposit_value"),
                  sql<string>`0`.as("swap_in_value"),
                  sql<string>`SUM(pool_swap.out_value)`.as("swap_out_value"),
                ])
                .where(
                  "chain_data.pool_swap.contract_address",
                  "=",
                  input.address
                )
                .where("chain_data.tx.date_block", ">=", input.from)
                .where("chain_data.tx.date_block", "<=", input.to)
                .groupBy("chain_data.pool_swap.token_out_address")
            )
            .as("combined")
        )
        .select([
          "token_address",
          sql<string>`SUM(deposit_value)`.as("total_deposit_value"),
          sql<string>`SUM(swap_in_value)`.as("total_swap_in_value"),
          sql<string>`SUM(swap_out_value)`.as("total_swap_out_value"),
        ])
        .groupBy("token_address")
        .execute();

      const details = await getMultipleVoucherDetails(
        publicClient,
        distributionData.map((d) => d.token_address) as `0x${string}`[]
      );

      return distributionData.map((d) => {
        const tokenDetail = details.find(
          (detail) => detail.address === d.token_address
        );
        const formatValue = (value: string) => {
          return tokenDetail?.decimals
            ? formatUnits(BigInt(value), tokenDetail.decimals)
            : value;
        };
        return {
          address: d.token_address,
          deposit_value: formatValue(d.total_deposit_value),
          swap_in_value: formatValue(d.total_swap_in_value),
          swap_out_value: formatValue(d.total_swap_out_value),
          name: tokenDetail?.name,
          symbol: tokenDetail?.symbol,
          decimals: tokenDetail?.decimals,
        };
      });
    }),
  statistics: publicProcedure
    .input(
      z.object({
        dateRange: z.object({
          from: z.date(),
          to: z.date(),
        }),
        addresses: z.array(
          z.string().refine(isAddress, { message: "Invalid address" })
        ),
      })
    )
    .query(async ({ ctx, input }) => {
      const { from, to } = input.dateRange;
      const stats = await ctx.federatedDB
        .selectFrom((subquery) =>
          subquery
            .selectFrom("chain_data.pool_swap")
            .innerJoin(
              "chain_data.tx",
              "chain_data.tx.id",
              "chain_data.pool_swap.tx_id"
            )
            .select([
              "chain_data.pool_swap.contract_address as pool_address",
              sql<string>`COUNT(*)`.as("total_swaps"),
              sql<string>`0`.as("total_deposits"),
              sql<string>`COUNT(DISTINCT chain_data.pool_swap.initiator_address)`.as(
                "unique_swappers"
              ),
              sql<string>`0`.as("unique_depositors"),
              sql<string>`SUM(chain_data.pool_swap.fee)`.as("total_fees"),
            ])
            .where(sql`DATE(chain_data.tx.date_block)`, ">=", from)
            .where(sql`DATE(chain_data.tx.date_block)`, "<=", to)
            .where(
              "chain_data.pool_swap.contract_address",
              "in",
              input.addresses
            )
            .groupBy("chain_data.pool_swap.contract_address")
            .union(
              subquery
                .selectFrom("chain_data.pool_deposit")
                .innerJoin(
                  "chain_data.tx",
                  "chain_data.tx.id",
                  "chain_data.pool_deposit.tx_id"
                )
                .select([
                  "chain_data.pool_deposit.contract_address as pool_address",
                  sql<string>`0`.as("total_swaps"),
                  sql<string>`COUNT(*)`.as("total_deposits"),
                  sql<string>`0`.as("unique_swappers"),
                  sql<string>`COUNT(DISTINCT pool_deposit.initiator_address)`.as(
                    "unique_depositors"
                  ),
                  sql<string>`0`.as("total_fees"),
                ])
                .where(sql`DATE(tx.date_block)`, ">=", from)
                .where(sql`DATE(tx.date_block)`, "<=", to)
                .where(
                  "chain_data.pool_deposit.contract_address",
                  "in",
                  input.addresses
                )
                .groupBy("chain_data.pool_deposit.contract_address")
            )
            .as("combined")
        )
        .select([
          "pool_address",
          sql<string>`SUM(total_swaps)`.as("total_swaps"),
          sql<string>`SUM(total_deposits)`.as("total_deposits"),
          sql<string>`SUM(unique_swappers)`.as("unique_swappers"),
          sql<string>`SUM(unique_depositors)`.as("unique_depositors"),
          sql<string>`SUM(total_fees)`.as("total_fees"),
        ])
        .groupBy("pool_address")
        .execute();

      return stats.map((s) => ({
        ...s,
        total_swaps: parseInt(s.total_swaps),
        total_deposits: parseInt(s.total_deposits),
        unique_swappers: parseInt(s.unique_swappers),
        unique_depositors: parseInt(s.unique_depositors),
      }));
    }),
  swapVolumeOverTime: publicProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
        from: z.date(),
        to: z.date(),
        interval: z.enum(["day", "week", "month"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const { from, to, interval } = input;
      const data = await ctx.federatedDB
        .selectFrom("chain_data.pool_swap")
        .innerJoin(
          "chain_data.tx",
          "chain_data.tx.id",
          "chain_data.pool_swap.tx_id"
        )
        .select([
          sql<string>`DATE_TRUNC(${interval}, chain_data.tx.date_block)`.as(
            "date"
          ),
          sql<string>`COUNT(*)`.as("swap_count"),
          sql<string>`SUM(chain_data.pool_swap.in_value)`.as("swap_volume"),
        ])
        .where("chain_data.pool_swap.contract_address", "=", input.address)
        .where(sql`DATE(chain_data.tx.date_block)`, ">=", from)
        .where(sql`DATE(chain_data.tx.date_block)`, "<=", to)
        .groupBy(sql`DATE_TRUNC(${interval}, chain_data.tx.date_block)`)
        .orderBy("date")
        .execute();

      return data;
    }),

  depositVolumeOverTime: publicProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
        from: z.date(),
        to: z.date(),
        interval: z.enum(["day", "week", "month"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const { from, to, interval } = input;
      const data = await ctx.federatedDB
        .selectFrom("chain_data.pool_deposit")
        .innerJoin(
          "chain_data.tx",
          "chain_data.tx.id",
          "chain_data.pool_deposit.tx_id"
        )
        .select([
          sql<string>`DATE_TRUNC(${interval}, chain_data.tx.date_block)`.as(
            "date"
          ),
          sql<string>`COUNT(*)`.as("deposit_count"),
          sql<string>`SUM(chain_data.pool_deposit.in_value)`.as(
            "deposit_volume"
          ),
        ])
        .where("chain_data.pool_deposit.contract_address", "=", input.address)
        .where(sql`DATE(chain_data.tx.date_block)`, ">=", from)
        .where(sql`DATE(chain_data.tx.date_block)`, "<=", to)
        .groupBy(sql`DATE_TRUNC(${interval}, chain_data.tx.date_block)`)
        .orderBy("date")
        .execute();

      return data;
    }),

  swapPairsData: publicProcedure
    .input(
      z.object({
        poolAddress: z
          .string()
          .refine(isAddress, { message: "Invalid address" })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const data = await getSwapPairsData({
        db: ctx.federatedDB,
        poolAddress: input.poolAddress,
      });
      const tokens = data.reduce((acc, d) => {
        acc.add(d.token_in_address as `0x${string}`);
        acc.add(d.token_out_address as `0x${string}`);
        return acc;
      }, new Set<`0x${string}`>());
      const tokenDetails = new Map<`0x${string}`, TokenDetails>();
      for (const token of tokens) {
        const details = await getTokenDetails(publicClient, { address: token });
        tokenDetails.set(token, details);
      }
      return data.map((d) => {
        return {
          ...d,
          swap_count: Number(d.swap_count),
          token_in_address: d.token_in_address as `0x${string}`,
          token_out_address: d.token_out_address as `0x${string}`,
          token_in_details: tokenDetails.get(
            d.token_in_address as `0x${string}`
          ),
          token_out_details: tokenDetails.get(
            d.token_out_address as `0x${string}`
          ),
        };
      });
    }),
});

function getSwapPairsData({
  db,
  poolAddress,
}: {
  db: Kysely<FederatedDB>;
  poolAddress?: `0x${string}`;
}) {
  let query = db
    .selectFrom("chain_data.pool_swap")
    .select(({ fn }) => [
      "token_in_address",
      "token_out_address",
      fn.countAll().as("swap_count"),
      sql<string>`SUM(in_value)`.as("total_in_value"),
      sql<string>`SUM(out_value)`.as("total_out_value"),
      sql<string>`SUM(fee)`.as("total_fees"),
      sql<string>`AVG(in_value)`.as("average_in_value"),
      sql<string>`AVG(out_value)`.as("average_out_value"),
    ])
    .groupBy(["token_in_address", "token_out_address"]);

  if (poolAddress) {
    query = query.where(
      "chain_data.pool_swap.contract_address",
      "=",
      poolAddress
    );
  }

  return query.execute();
}
