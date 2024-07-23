import { TRPCError } from "@trpc/server";
import { isAddress } from "viem";
import { z } from "zod";
import { PoolIndex } from "@grassroots/contracts";
import { TokenIndex } from "@grassroots/contracts/erc20-token-index/index";
import { Limiter } from "@grassroots/contracts/limiter/index";
import { PriceIndexQuote } from "@grassroots/contracts/price-index-quote/index";
import { SwapPool } from "@grassroots/contracts/swap-pool/index";
import { publicClient } from "@grassroots/shared/utils/web3";
import {
  adminProcedure,
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";
import { sendNewPoolEmbed } from "../utils/discord";
import { isAdmin, isStaff } from "@grassroots/auth";

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
  remove: adminProcedure
    .input(z.string().refine(isAddress))
    .mutation(async ({ input }) => {
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
      const pool = new SwapPool(input.address, publicClient);
      const owner = await pool.getOwner();
      if (
        owner !== ctx.user.account.blockchain_address &&
        !(isAdmin(ctx.user) || isStaff(ctx.user))
      ) {
        throw new Error("You are not allowed to update this pool");
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
});
