import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
import { formatUnits, isAddress } from "viem";
import { z } from "zod";
import { getMultipleVoucherDetails } from "~/components/pools/contract-functions";
import { PoolIndex } from "~/contracts";
import { TokenIndex } from "~/contracts/erc20-token-index";
import { getIsOwner } from "~/contracts/helpers";
import { Limiter } from "~/contracts/limiter";
import { PriceIndexQuote } from "~/contracts/price-index-quote";
import { SwapPool } from "~/contracts/swap-pool";
import { publicClient } from "~/lib/web3";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { sendNewPoolEmbed } from "~/server/discord";
import { hasPermission } from "~/utils/permissions";

export type GeneratorYieldType = {
  message: string;
  status: string;
  address?: `0x${string}`;
  error?: string;
};

export type InferAsyncGenerator<Gen> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Gen extends AsyncGenerator<infer T, any, any> ? T : never;

export const poolRouter = createTRPCRouter({
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
    .mutation(async function* ({ ctx, input }) {
      try {
        yield { message: "Deploying", status: "loading" };

        const userAddress = ctx.user.account.blockchain_address;

        yield { message: "Deploying Token Registry", status: "loading" };
        const tokenRegistry = await TokenIndex.deploy(publicClient);

        yield { message: "Adding Writer to Token Registry", status: "loading" };
        await tokenRegistry.addWriter(userAddress);

        yield { message: "Deploying Limiter", status: "loading" };
        const limiter = await Limiter.deploy({ publicClient });

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
        const db_pool = await ctx.graphDB
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
            let tagId = await ctx.graphDB
              .selectFrom("tags")
              .select("id")
              .where("tag", "=", tag)
              .executeTakeFirst();
            if (!tagId) {
              tagId = await ctx.graphDB
                .insertInto("tags")
                .values({ tag })
                .returning("id")
                .executeTakeFirst();
            }

            await ctx.graphDB
              .insertInto("swap_pool_tags")
              .values({
                swap_pool: db_pool.id,
                tag: tagId!.id,
              })
              .execute();
          }
        }
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
  remove: authenticatedProcedure
    .input(z.string().refine(isAddress))
    .mutation(async ({ ctx, input }) => {
      const isContractOwner = await getIsOwner(
        ctx.user.account.blockchain_address,
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
      await PoolIndex.remove(input);
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

        const tags = await ctx.graphDB
          .selectFrom("tags")
          .innerJoin("swap_pool_tags", "swap_pool_tags.tag", "tags.id")
          .where("swap_pool_tags.swap_pool", "=", pool.id)
          .select("tags.tag")
          .execute();

        return {
          ...pool,
          tags: tags.map((t) => t.tag),
        };
      } catch (error) {
        console.error("Error during pool retrieval:", error);
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
      const isContractOwner = await getIsOwner(
        ctx.user.account.blockchain_address,
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
      if (input.tags) {
        const existingTags = await ctx.graphDB
          .selectFrom("swap_pool_tags")
          .where("swap_pool", "=", db_pool.id)
          .innerJoin("tags", "tags.id", "swap_pool_tags.tag")
          .select(["tags.tag as tag_name", "tags.id as tag_id"])
          .execute();

        const existingTagIds = existingTags.map((tag) => tag.tag_id);

        for (const tag of input.tags) {
          let tagId = await ctx.graphDB
            .selectFrom("tags")
            .select("id")
            .where("tag", "=", tag)
            .executeTakeFirst();

          if (!tagId) {
            // Create a new tag if it doesn't exist
            tagId = await ctx.graphDB
              .insertInto("tags")
              .values({ tag })
              .returning("id")
              .executeTakeFirst();
          }

          // Add the tag to the pool if it doesn't exist
          if (!existingTagIds.includes(tagId!.id)) {
            await ctx.graphDB
              .insertInto("swap_pool_tags")
              .values({
                swap_pool: db_pool.id,
                tag: tagId!.id,
              })
              .execute();
          }
        }
        for (const existingTag of existingTags) {
          if (!input.tags.includes(existingTag.tag_name)) {
            await ctx.graphDB
              .deleteFrom("swap_pool_tags")
              .where("swap_pool", "=", db_pool.id)
              .where("tag", "=", existingTag.tag_id)
              .execute();
          }
        }
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
      let query = ctx.indexerDB
        .selectFrom(
          ctx.indexerDB
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
            ])
            .union(
              ctx.indexerDB
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
                ])
            )
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
                .where('tx.date_block', '>=', input.from)
                .where('tx.date_block', '<=', input.to)
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
                .where('tx.date_block', '>=', input.from)
                .where('tx.date_block', '<=', input.to)
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
        distributionData.map((d) => d.token_address) as `0x${string}`[]
      );

      return distributionData.map((d) => {
        const tokenDetail = details.find(
          (detail) => detail.address === d.token_address
        );
        const formatValue = (value: string) => {
          return tokenDetail?.decimals ? formatUnits(BigInt(value), tokenDetail.decimals) : value;
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
});
