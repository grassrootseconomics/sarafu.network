import { TRPCError } from "@trpc/server";
import { type Kysely, sql } from "kysely";
import { formatUnits, getAddress, isAddress } from "viem";
import { z } from "zod";
import { getMultipleVoucherDetails } from "~/components/pools/contract-functions";
import { PoolIndex } from "~/contracts";
import { TokenIndex } from "~/contracts/erc20-token-index";
import { getIsContractOwner } from "~/contracts/helpers";
import { Limiter } from "~/contracts/limiter";
import { PriceIndexQuote } from "~/contracts/price-index-quote";
import { SwapPool } from "~/contracts/swap-pool";
import { config } from "~/lib/web3";
import {
  authenticatedProcedure,
  publicProcedure,
  router,
} from "~/server/api/trpc";
import { publicClient } from "~/server/client";
import { type IndexerDB } from "~/server/db";
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

// Add types for the yeilds
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
        yield { message: "Deploying", status: "loading" };

        const userAddress = getAddress(ctx.session.address);

        yield { message: "Deploying Token Registry", status: "loading" };
        const tokenRegistry = await TokenIndex.deploy(publicClient);

        yield { message: "Adding Writer to Token Registry", status: "loading" };
        await tokenRegistry.addWriter(userAddress);

        yield { message: "Deploying Limiter", status: "loading" };
        const limiter = await Limiter.deploy(publicClient);

        yield { message: "Deploying Swap Pool", status: "loading" };
        const swapPool = await SwapPool.deploy({
          publicClient,
          name: input.name,
          symbol: input.symbol,
          decimals: input.decimals,
          tokenRegistryAddress: tokenRegistry.address,
          limiterAddress: limiter.address,
        });
        yield { message: "Deploying Quoter", status: "loading" };
        const quoter = await PriceIndexQuote.deploy({ publicClient });
        yield { message: "Adding Quoter to Swap Pool", status: "loading" };
        await swapPool.setQuoter(quoter.address);

        yield { message: "Adding pool to database", status: "loading" };
        const tagModel = new TagModel(ctx.graphDB);
        await ctx.graphDB.transaction().execute(async (trx) => {
          const db_pool = await trx
            .insertInto("swap_pools")
            .values({
              pool_address: swapPool.address,
              swap_pool_description: input.description,
              banner_url: input.banner_url,
            })
            .returning("id")
            .executeTakeFirstOrThrow();
          if (input.tags && input.tags.length > 0) {
            for (const tag of input.tags) {
              await tagModel.addTagToPool(db_pool.id, tag);
            }
          }
          return db_pool;
        });
        yield { message: "Adding Pool to Index", status: "loading" };
        await PoolIndex.add(swapPool.address);

        yield { message: "Transferring Ownership", status: "loading" };
        await tokenRegistry.transferOwnership(userAddress);
        await limiter.transferOwnership(userAddress);
        await swapPool.transferOwnership(userAddress);
        await quoter.transferOwnership(userAddress);

        yield {
          message: "Successfully Deployed",
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
      // Run these queries in parallel to reduce total wait time
      const [swapCounts, indexerPools, poolMetadata] = await Promise.all([
        // Get swap counts from indexer DB
        ctx.indexerDB
          .selectFrom("pool_swap")
          .select(["contract_address", sql<number>`COUNT(*)`.as("swap_count")])
          .groupBy("contract_address")
          .execute(),

        // Get basic pool information from indexer DB
        ctx.indexerDB
          .selectFrom("pools")
          .where("removed", "=", false)
          .select(["contract_address", "pool_name", "pool_symbol"])
          .execute(),

        // Get additional metadata from graph DB
        ctx.graphDB
          .selectFrom("swap_pools")
          .leftJoin(
            "swap_pool_tags",
            "swap_pools.id",
            "swap_pool_tags.swap_pool"
          )
          .leftJoin("tags", "swap_pool_tags.tag", "tags.id")
          .select([
            "swap_pools.pool_address",
            "swap_pools.swap_pool_description",
            "swap_pools.banner_url",
            sql<string[]>`array_agg(DISTINCT tags.tag)`.as("tags"),
          ])
          .groupBy([
            "swap_pools.pool_address",
            "swap_pools.swap_pool_description",
            "swap_pools.banner_url",
          ])
          .execute(),
      ]);

      // Get voucher counts in parallel using Promise.all
      const voucherCountPromises = indexerPools.map(async (pool) => {
        const swapPool = new SwapPool(
          pool.contract_address as `0x${string}`,
          publicClient
        );
        const count = await swapPool.getVouchersCount();
        return {
          contract_address: pool.contract_address,
          voucher_count: Number(count),
        };
      });
      const voucherCounts = await Promise.all(voucherCountPromises);

      // Merge all the data
      const mergedPools = indexerPools.map((pool) => {
        const metadata = poolMetadata.find(
          (meta) => meta.pool_address === pool.contract_address
        );
        const swapData = swapCounts.find(
          (sc) => sc.contract_address === pool.contract_address
        );
        const voucherData = voucherCounts.find(
          (vc) => vc.contract_address === pool.contract_address
        );
        return {
          ...pool,
          description: metadata?.swap_pool_description ?? "",
          banner_url: metadata?.banner_url ?? null,
          tags: metadata?.tags?.filter(Boolean) ?? [],
          swap_count: swapData?.swap_count ?? 0,
          voucher_count: voucherData?.voucher_count ?? 0,
        };
      });

      // Sort the pools based on input
      const sortedPools = [...mergedPools].sort((a, b) => {
        if (input.sortBy === "swaps") {
          return input.sortDirection === "desc"
            ? b.swap_count - a.swap_count
            : a.swap_count - b.swap_count;
        } else if (input.sortBy === "vouchers") {
          return input.sortDirection === "desc"
            ? b.voucher_count - a.voucher_count
            : a.voucher_count - b.voucher_count;
        } else {
          return input.sortDirection === "desc"
            ? b.pool_name.localeCompare(a.pool_name)
            : a.pool_name.localeCompare(b.pool_name);
        }
      });

      return sortedPools;
    }),
  remove: authenticatedProcedure
    .input(z.string().refine(isAddress))
    .mutation(async ({ ctx, input }) => {
      const isContractOwner = await getIsContractOwner(
        ctx.session.address,
        input
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
          .where("pool_address", "=", input)
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
        await PoolIndex.remove(input);
      });
      return { message: "Pool removed successfully" };
    }),

  get: publicProcedure
    .input(z.string().refine(isAddress, { message: "Invalid address" }))
    .query(async ({ ctx, input }) => {
      try {
        const pool = await ctx.graphDB
          .selectFrom("swap_pools")
          .where("pool_address", "=", input)
          .selectAll()
          .executeTakeFirstOrThrow();

        const tagModel = new TagModel(ctx.graphDB);
        const tags = await tagModel.getPoolTags(pool.id);

        return {
          ...pool,
          tags: tags,
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
      const swaps = await ctx.indexerDB
        .selectFrom("pool_swap")
        .leftJoin("tx", "tx.id", "pool_swap.tx_id")
        .where("contract_address", "=", input.address)
        .orderBy("tx.date_block", "desc")
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
      const deposits = await ctx.indexerDB
        .selectFrom("pool_deposit")
        .leftJoin("tx", "tx.id", "pool_deposit.tx_id")
        .where("contract_address", "=", input.address)
        .orderBy("tx.date_block", "desc")
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
      const isContractOwner = await getIsContractOwner(
        ctx.session.address,
        input.address
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
        .where("pool_address", "=", input.address)
        .returning("id")
        .executeTakeFirst();
      if (!db_pool) {
        db_pool = await ctx.graphDB
          .insertInto("swap_pools")
          .values({
            pool_address: input.address,
            banner_url: input.banner_url,
            swap_pool_description: input.swap_pool_description ?? "",
          })
          .returning("id")
          .executeTakeFirstOrThrow();
      }
      const tagModel = new TagModel(ctx.graphDB);
      if (input.tags) {
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
      const swapsSubquery = ctx.indexerDB
        .selectFrom("pool_swap")
        .leftJoin("tx", "tx.id", "pool_swap.tx_id")
        .where("pool_swap.contract_address", "=", input.address)
        .select([
          sql<"swap" | "deposit">`'swap'`.as("type"),
          "tx.date_block",
          "tx.tx_hash",
          "tx.success",
          "pool_swap.initiator_address",
          "pool_swap.token_in_address",
          "pool_swap.token_out_address",
          "pool_swap.in_value",
          "pool_swap.out_value",
          "pool_swap.fee",
        ]);

      // Subquery for deposits, excluding those with tx_ids in swaps
      const depositsSubquery = ctx.indexerDB
        .selectFrom("pool_deposit")
        .leftJoin("tx", "tx.id", "pool_deposit.tx_id")
        .where("pool_deposit.contract_address", "=", input.address)

        .select([
          sql<"deposit">`'deposit'`.as("type"),
          "tx.date_block",
          "tx.tx_hash",
          "tx.success",
          "pool_deposit.initiator_address",
          "pool_deposit.token_in_address",
          sql<string>`NULL`.as("token_out_address"),
          "pool_deposit.in_value",
          sql<string>`NULL`.as("out_value"),
          sql<string>`NULL`.as("fee"),
        ]);
      // Subquery for token transfers
      const transfersSubquery = ctx.indexerDB
        .selectFrom("token_transfer")
        .leftJoin("tx", "tx.id", "token_transfer.tx_id")
        .leftJoin("pool_swap", "token_transfer.tx_id", "pool_swap.tx_id")
        .where("token_transfer.recipient_address", "=", input.address)
        .where("pool_swap.tx_id", "is", null)
        .select([
          sql<"deposit">`'deposit'`.as("type"),
          "tx.date_block",
          "tx.tx_hash",
          "tx.success",
          "token_transfer.sender_address as initiator_address",
          "token_transfer.contract_address as token_in_address",
          sql<string>`NULL`.as("token_out_address"),
          "token_transfer.transfer_value as in_value",
          sql<string>`NULL`.as("out_value"),
          sql<string>`NULL`.as("fee"),
        ]);

      // Combine all subqueries
      let query = ctx.indexerDB
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
      const distributionData = await ctx.indexerDB
        .selectFrom((subquery) =>
          subquery
            .selectFrom("pool_deposit")
            .innerJoin("tx", "tx.id", "pool_deposit.tx_id")
            .select([
              "pool_deposit.token_in_address as token_address",
              sql<string>`SUM(pool_deposit.in_value)`.as("deposit_value"),
              sql<string>`0`.as("swap_in_value"),
              sql<string>`0`.as("swap_out_value"),
            ])
            .where("pool_deposit.contract_address", "=", input.address)
            .where("tx.date_block", ">=", input.from)
            .where("tx.date_block", "<=", input.to)
            .groupBy("pool_deposit.token_in_address")
            .union(
              subquery
                .selectFrom("pool_swap")
                .innerJoin("tx", "tx.id", "pool_swap.tx_id")
                .select([
                  "pool_swap.token_in_address as token_address",
                  sql<string>`0`.as("deposit_value"),
                  sql<string>`SUM(pool_swap.in_value)`.as("swap_in_value"),
                  sql<string>`0`.as("swap_out_value"),
                ])
                .where("pool_swap.contract_address", "=", input.address)
                .where("tx.date_block", ">=", input.from)
                .where("tx.date_block", "<=", input.to)
                .groupBy("pool_swap.token_in_address")
            )
            .union(
              subquery
                .selectFrom("pool_swap")
                .innerJoin("tx", "tx.id", "pool_swap.tx_id")
                .select([
                  "pool_swap.token_out_address as token_address",
                  sql<string>`0`.as("deposit_value"),
                  sql<string>`0`.as("swap_in_value"),
                  sql<string>`SUM(pool_swap.out_value)`.as("swap_out_value"),
                ])
                .where("pool_swap.contract_address", "=", input.address)
                .where("tx.date_block", ">=", input.from)
                .where("tx.date_block", "<=", input.to)
                .groupBy("pool_swap.token_out_address")
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
        config,
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
      const stats = await ctx.indexerDB
        .selectFrom((subquery) =>
          subquery
            .selectFrom("pool_swap")
            .innerJoin("tx", "tx.id", "pool_swap.tx_id")
            .select([
              "pool_swap.contract_address as pool_address",
              sql<string>`COUNT(*)`.as("total_swaps"),
              sql<string>`0`.as("total_deposits"),
              sql<string>`COUNT(DISTINCT pool_swap.initiator_address)`.as(
                "unique_swappers"
              ),
              sql<string>`0`.as("unique_depositors"),
              sql<string>`SUM(pool_swap.fee)`.as("total_fees"),
            ])
            .where(sql`DATE(tx.date_block)`, ">=", from)
            .where(sql`DATE(tx.date_block)`, "<=", to)
            .where("pool_swap.contract_address", "in", input.addresses)
            .groupBy("pool_swap.contract_address")
            .union(
              subquery
                .selectFrom("pool_deposit")
                .innerJoin("tx", "tx.id", "pool_deposit.tx_id")
                .select([
                  "pool_deposit.contract_address as pool_address",
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
                .where("pool_deposit.contract_address", "in", input.addresses)
                .groupBy("pool_deposit.contract_address")
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

      return stats;
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
      const data = await ctx.indexerDB
        .selectFrom("pool_swap")
        .innerJoin("tx", "tx.id", "pool_swap.tx_id")
        .select([
          sql<string>`DATE_TRUNC(${interval}, tx.date_block)`.as("date"),
          sql<string>`COUNT(*)`.as("swap_count"),
          sql<string>`SUM(pool_swap.in_value)`.as("swap_volume"),
        ])
        .where("pool_swap.contract_address", "=", input.address)
        .where(sql`DATE(tx.date_block)`, ">=", from)
        .where(sql`DATE(tx.date_block)`, "<=", to)
        .groupBy(sql`DATE_TRUNC(${interval}, tx.date_block)`)
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
      const data = await ctx.indexerDB
        .selectFrom("pool_deposit")
        .innerJoin("tx", "tx.id", "pool_deposit.tx_id")
        .select([
          sql<string>`DATE_TRUNC(${interval}, tx.date_block)`.as("date"),
          sql<string>`COUNT(*)`.as("deposit_count"),
          sql<string>`SUM(pool_deposit.in_value)`.as("deposit_volume"),
        ])
        .where("pool_deposit.contract_address", "=", input.address)
        .where(sql`DATE(tx.date_block)`, ">=", from)
        .where(sql`DATE(tx.date_block)`, "<=", to)
        .groupBy(sql`DATE_TRUNC(${interval}, tx.date_block)`)
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
        db: ctx.indexerDB,
        poolAddress: input.poolAddress,
      });
      const tokens = data.reduce((acc, d) => {
        acc.add(d.token_in_address as `0x${string}`);
        acc.add(d.token_out_address as `0x${string}`);
        return acc;
      }, new Set<`0x${string}`>());
      const tokenDetails = new Map<`0x${string}`, TokenDetails>();
      for (const token of tokens) {
        const details = await getTokenDetails({ address: token });
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
  db: Kysely<IndexerDB>;
  poolAddress?: `0x${string}`;
}) {
  let query = db
    .selectFrom("pool_swap")
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
    query = query.where("pool_swap.contract_address", "=", poolAddress);
  }

  return query.execute();
}
