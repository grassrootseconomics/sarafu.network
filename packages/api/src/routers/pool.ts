import { TRPCError } from "@trpc/server";
import { sql, type Kysely } from "kysely";
import { formatUnits, getAddress, isAddress } from "viem";
import { z } from "zod";
import {
  type Chain,
  erc20Abi,
  type PublicClient,
  type Transport,
} from "viem";
import { publicClient } from "@sarafu/contracts/chain";

// Inlined from components/pools/contract-functions to avoid cross-package dependency
async function getMultipleVoucherDetails<C extends Chain>(
  client: PublicClient<Transport, C>,
  addresses: `0x${string}`[]
) {
  const contracts = addresses.flatMap((address) => [
    { address, abi: erc20Abi, functionName: "symbol" as const },
    { address, abi: erc20Abi, functionName: "name" as const },
    { address, abi: erc20Abi, functionName: "decimals" as const },
  ]);
  const data = await client.multicall({ contracts });
  return addresses.map((address, index) => {
    const baseIndex = index * 3;
    return {
      address,
      symbol: data?.[baseIndex]?.result as string | undefined,
      name: data?.[baseIndex + 1]?.result as string | undefined,
      decimals: data?.[baseIndex + 2]?.result
        ? Number(data?.[baseIndex + 2]?.result)
        : undefined,
    };
  });
}
import { PoolIndex } from "@sarafu/contracts";
import { getIsContractOwner } from "@sarafu/contracts/helpers";
import {
  deployPool,
  getContractAddressFromTxHash,
  OTXType,
  preCalculateContractAddress,
  trackOTX,
} from "@sarafu/contracts/sarafu/custodial";
import {
  authenticatedProcedure,
  publicProcedure,
  router,
} from "../trpc";
import { type FederatedDB } from "../db";
import { sendNewPoolEmbed } from "../discord";
import { cacheWithExpiry } from "../cache/cache";
import { cacheQuery } from "../cache/cacheQuery";
import { redis } from "../cache/kv";
import { hasPermission } from "@sarafu/core/permissions";
import { addressSchema } from "@sarafu/core/zod";
import { PoolModel } from "../models/pool";
import { getTokenDetails, type TokenDetails } from "../models/token";

export type GeneratorYieldType = {
  message: string;
  status: "loading" | "success" | "error";
  address?: `0x${string}`;
  txHash?: `0x${string}`;
  error?: string;
};

export type InferAsyncGenerator<Gen> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Gen extends AsyncGenerator<infer T, any, any> ? T : never;

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
        unit_of_account: z.string().min(1).max(50),
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

        // Inline waitForDeployment with status updates
        let contractAddress: `0x${string}` | null = null;
        let txHash: `0x${string}` | null = null;
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts && !contractAddress) {
          await new Promise((resolve) => setTimeout(resolve, 4000));
          attempts++;

          if (attempts % 5 === 0) {
            yield {
              message: `2/4 - Still waiting for confirmation (${
                attempts * 2
              }s elapsed)`,
              status: "loading",
            };
          }

          try {
            const trackingResponse = await trackOTX(
              poolDeployResponse.result.trackingId
            );
            const poolTransaction = trackingResponse.result.otx.find(
              (tx) =>
                tx.otxType === OTXType.SWAPPOOL_DEPLOY &&
                tx.status === "SUCCESS"
            );

            if (poolTransaction) {
              // Pre-calculate address (instant, deterministic)
              const preCalculatedAddress = preCalculateContractAddress(
                poolTransaction.signerAccount as `0x${string}`,
                poolTransaction.nonce
              );

              yield {
                message: "2/4 - Contract deployed, preparing database entry",
                status: "loading",
              };

              // Optionally try quick RPC verification (non-blocking)
              const rpcAddress = await getContractAddressFromTxHash(
                publicClient,
                poolTransaction.txHash
              );

              // Use RPC address if available, otherwise use pre-calculated
              contractAddress = rpcAddress ?? preCalculatedAddress;
              txHash = poolTransaction.txHash as `0x${string}`;

              break;
            }
          } catch (error) {
            console.error("Error tracking OTX:", error);
          }
        }

        if (!contractAddress) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get pool address after deployment",
          });
        }

        const swapPool = { address: contractAddress };
        yield { message: "3/4 - Saving pool to database", status: "loading" };

        const poolModel = new PoolModel(ctx);
        await poolModel.create(swapPool.address, {
          ...input,
          pool_name: input.name,
        });
        // Invalidate featured pools cache
        void invalidateFeaturedPoolsCache();

        yield {
          message: "4/4 - Pool successfully deployed!",
          status: "success",
          address: swapPool.address,
          txHash: txHash ?? undefined,
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
      const poolModel = new PoolModel(ctx);
      return poolModel.list(input);
    }),
  remove: authenticatedProcedure
    .input(addressSchema)
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
      const poolModel = new PoolModel(ctx);
      await poolModel.remove(pool_address);
      await PoolIndex.remove(pool_address);
      void invalidateFeaturedPoolsCache();
      return { message: "Pool removed successfully" };
    }),

  get: publicProcedure.input(addressSchema).query(async ({ ctx, input }) => {
    const poolModel = new PoolModel(ctx);
    return poolModel.get(getAddress(input));
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
      const pool_address = getAddress(input.address);
      const swaps = await ctx.federatedDB
        .selectFrom("chain_data_v2.pool_swap")
        .leftJoin(
          "chain_data_v2.tx",
          "chain_data_v2.tx.id",
          "chain_data_v2.pool_swap.tx_id"
        )
        .where("contract_address", "=", pool_address)
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
      const pool_address = getAddress(input.address);
      const deposits = await ctx.federatedDB
        .selectFrom("chain_data_v2.pool_deposit")
        .leftJoin(
          "chain_data_v2.tx",
          "chain_data_v2.tx.id",
          "chain_data_v2.pool_deposit.tx_id"
        )
        .where("contract_address", "=", pool_address)
        .orderBy("chain_data_v2.tx.date_block", "desc")
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
        pool_address: z
          .string()
          .refine(isAddress, { message: "Invalid address" }),
        pool_name: z.string().max(255).optional().nullable(),
        banner_url: z.string().url().optional().nullable(),
        swap_pool_description: z.string().optional(),
        unit_of_account: z.string().min(1).max(50).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pool_address = getAddress(input.pool_address);
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
      const poolModel = new PoolModel(ctx);
      const result = await poolModel.update(pool_address, input);
      void invalidateFeaturedPoolsCache();
      return result;
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
      const pool_address = getAddress(input.address);

      // Subquery for swaps
      const swapsSubquery = ctx.federatedDB
        .selectFrom("chain_data_v2.pool_swap")
        .leftJoin(
          "chain_data_v2.tx",
          "chain_data_v2.tx.id",
          "chain_data_v2.pool_swap.tx_id"
        )
        .where("chain_data_v2.pool_swap.contract_address", "=", pool_address)
        .select([
          sql<"swap" | "deposit">`'swap'`.as("type"),
          "chain_data_v2.tx.date_block",
          "chain_data_v2.tx.tx_hash",
          "chain_data_v2.tx.success",
          "chain_data_v2.pool_swap.initiator_address",
          "chain_data_v2.pool_swap.token_in_address",
          "chain_data_v2.pool_swap.token_out_address",
          "chain_data_v2.pool_swap.in_value",
          "chain_data_v2.pool_swap.out_value",
          "chain_data_v2.pool_swap.fee",
        ]);

      // Subquery for deposits, excluding those with tx_ids in swaps
      const depositsSubquery = ctx.federatedDB
        .selectFrom("chain_data_v2.pool_deposit")
        .leftJoin(
          "chain_data_v2.tx",
          "chain_data_v2.tx.id",
          "chain_data_v2.pool_deposit.tx_id"
        )
        .leftJoin("chain_data_v2.pool_swap", (join) =>
          join
            .onRef(
              "chain_data_v2.pool_swap.tx_id",
              "=",
              "chain_data_v2.pool_deposit.tx_id"
            )
            .onRef(
              "chain_data_v2.pool_swap.contract_address",
              "=",
              "chain_data_v2.pool_deposit.contract_address"
            )
        )
        .where("chain_data_v2.pool_deposit.contract_address", "=", pool_address)
        .where("chain_data_v2.pool_swap.tx_id", "is", null)

        .select([
          sql<"deposit">`'deposit'`.as("type"),
          "chain_data_v2.tx.date_block",
          "chain_data_v2.tx.tx_hash",
          "chain_data_v2.tx.success",
          "chain_data_v2.pool_deposit.initiator_address",
          "chain_data_v2.pool_deposit.token_in_address",
          sql<string>`NULL`.as("token_out_address"),
          "chain_data_v2.pool_deposit.in_value",
          sql<string>`NULL`.as("out_value"),
          sql<string>`NULL`.as("fee"),
        ]);
      // Subquery for token transfers
      const transfersSubquery = ctx.federatedDB
        .selectFrom("chain_data_v2.token_transfer")
        .leftJoin(
          "chain_data_v2.tx",
          "chain_data_v2.tx.id",
          "chain_data_v2.token_transfer.tx_id"
        )
        .leftJoin(
          "chain_data_v2.pool_swap",
          "chain_data_v2.token_transfer.tx_id",
          "chain_data_v2.pool_swap.tx_id"
        )
        .where("chain_data_v2.token_transfer.recipient_address", "=", pool_address)
        .where("chain_data_v2.pool_swap.tx_id", "is", null)
        .select([
          sql<"deposit">`'deposit'`.as("type"),
          "chain_data_v2.tx.date_block",
          "chain_data_v2.tx.tx_hash",
          "chain_data_v2.tx.success",
          "chain_data_v2.token_transfer.sender_address as initiator_address",
          "chain_data_v2.token_transfer.contract_address as token_in_address",
          sql<string>`NULL`.as("token_out_address"),
          "chain_data_v2.token_transfer.transfer_value as in_value",
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
      const pool_address = getAddress(input.address);
      const distributionData = await ctx.federatedDB
        .selectFrom((subquery) =>
          subquery
            .selectFrom("chain_data_v2.pool_deposit")
            .innerJoin(
              "chain_data_v2.tx",
              "chain_data_v2.tx.id",
              "chain_data_v2.pool_deposit.tx_id"
            )
            .select([
              "chain_data_v2.pool_deposit.token_in_address as token_address",
              sql<string>`SUM(chain_data_v2.pool_deposit.in_value)`.as(
                "deposit_value"
              ),
              sql<string>`0`.as("swap_in_value"),
              sql<string>`0`.as("swap_out_value"),
            ])
            .where(
              "chain_data_v2.pool_deposit.contract_address",
              "=",
              pool_address
            )
            .where("chain_data_v2.tx.date_block", ">=", input.from)
            .where("chain_data_v2.tx.date_block", "<=", input.to)
            .groupBy("chain_data_v2.pool_deposit.token_in_address")
            .union(
              subquery
                .selectFrom("chain_data_v2.pool_swap")
                .innerJoin(
                  "chain_data_v2.tx",
                  "chain_data_v2.tx.id",
                  "chain_data_v2.pool_swap.tx_id"
                )
                .select([
                  "chain_data_v2.pool_swap.token_in_address as token_address",
                  sql<string>`0`.as("deposit_value"),
                  sql<string>`SUM(pool_swap.in_value)`.as("swap_in_value"),
                  sql<string>`0`.as("swap_out_value"),
                ])
                .where(
                  "chain_data_v2.pool_swap.contract_address",
                  "=",
                  pool_address
                )
                .where("chain_data_v2.tx.date_block", ">=", input.from)
                .where("chain_data_v2.tx.date_block", "<=", input.to)
                .groupBy("chain_data_v2.pool_swap.token_in_address")
            )
            .union(
              subquery
                .selectFrom("chain_data_v2.pool_swap")
                .innerJoin(
                  "chain_data_v2.tx",
                  "chain_data_v2.tx.id",
                  "chain_data_v2.pool_swap.tx_id"
                )
                .select([
                  "chain_data_v2.pool_swap.token_out_address as token_address",
                  sql<string>`0`.as("deposit_value"),
                  sql<string>`0`.as("swap_in_value"),
                  sql<string>`SUM(pool_swap.out_value)`.as("swap_out_value"),
                ])
                .where(
                  "chain_data_v2.pool_swap.contract_address",
                  "=",
                  pool_address
                )
                .where("chain_data_v2.tx.date_block", ">=", input.from)
                .where("chain_data_v2.tx.date_block", "<=", input.to)
                .groupBy("chain_data_v2.pool_swap.token_out_address")
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
    .query(
      cacheQuery(3600, async ({ ctx, input }) => {
        const { from, to } = input.dateRange;
        const pool_addresses = input.addresses.map(getAddress);
        if (pool_addresses.length === 0) return [];
        const pool_addresses_lower = pool_addresses.map((a) => a.toLowerCase());
        const query = ctx.federatedDB
          .selectFrom((subquery) =>
            subquery
              .selectFrom("chain_data_v2.pool_swap")
              .innerJoin(
                "chain_data_v2.tx",
                "chain_data_v2.tx.id",
                "chain_data_v2.pool_swap.tx_id"
              )
              .select([
                "chain_data_v2.pool_swap.contract_address as pool_address",
                sql<string>`COUNT(*)`.as("total_swaps"),
                sql<string>`0`.as("total_deposits"),
                sql<string>`COUNT(DISTINCT chain_data_v2.pool_swap.initiator_address)`.as(
                  "unique_swappers"
                ),
                sql<string>`0`.as("unique_depositors"),
                sql<string>`SUM(chain_data_v2.pool_swap.fee)`.as("total_fees"),
              ])
              .where(sql`DATE(chain_data_v2.tx.date_block)`, ">=", from)
              .where(sql`DATE(chain_data_v2.tx.date_block)`, "<=", to)
              .where(
                sql`LOWER(chain_data_v2.pool_swap.contract_address)`,
                "in",
                pool_addresses_lower
              )
              .groupBy("chain_data_v2.pool_swap.contract_address")
              .union(
                subquery
                  .selectFrom("chain_data_v2.pool_deposit")
                  .innerJoin(
                    "chain_data_v2.tx",
                    "chain_data_v2.tx.id",
                    "chain_data_v2.pool_deposit.tx_id"
                  )
                  .select([
                    "chain_data_v2.pool_deposit.contract_address as pool_address",
                    sql<string>`0`.as("total_swaps"),
                    sql<string>`COUNT(*)`.as("total_deposits"),
                    sql<string>`0`.as("unique_swappers"),
                    sql<string>`COUNT(DISTINCT chain_data_v2.pool_deposit.initiator_address)`.as(
                      "unique_depositors"
                    ),
                    sql<string>`0`.as("total_fees"),
                  ])
                  .where(sql`DATE(chain_data_v2.tx.date_block)`, ">=", from)
                  .where(sql`DATE(chain_data_v2.tx.date_block)`, "<=", to)
                  .where(
                    sql`LOWER(chain_data_v2.pool_deposit.contract_address)`,
                    "in",
                    pool_addresses_lower
                  )
                  .groupBy("chain_data_v2.pool_deposit.contract_address")
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
          .groupBy("pool_address");
        const stats = await query.execute();

        return stats.map((s) => ({
          ...s,
          total_swaps: parseInt(s.total_swaps),
          total_deposits: parseInt(s.total_deposits),
          unique_swappers: parseInt(s.unique_swappers),
          unique_depositors: parseInt(s.unique_depositors),
        }));
      })
    ),
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
      const pool_address = getAddress(input.address);
      const data = await ctx.federatedDB
        .selectFrom("chain_data_v2.pool_swap")
        .innerJoin(
          "chain_data_v2.tx",
          "chain_data_v2.tx.id",
          "chain_data_v2.pool_swap.tx_id"
        )
        .select([
          sql<string>`DATE_TRUNC(${interval}, chain_data_v2.tx.date_block)`.as(
            "date"
          ),
          sql<string>`COUNT(*)`.as("swap_count"),
          sql<string>`SUM(chain_data_v2.pool_swap.in_value)`.as("swap_volume"),
        ])
        .where("chain_data_v2.pool_swap.contract_address", "=", pool_address)
        .where(sql`DATE(chain_data_v2.tx.date_block)`, ">=", from)
        .where(sql`DATE(chain_data_v2.tx.date_block)`, "<=", to)
        .groupBy(sql`DATE_TRUNC(${interval}, chain_data_v2.tx.date_block)`)
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
      const pool_address = getAddress(input.address);
      const data = await ctx.federatedDB
        .selectFrom("chain_data_v2.pool_deposit")
        .innerJoin(
          "chain_data_v2.tx",
          "chain_data_v2.tx.id",
          "chain_data_v2.pool_deposit.tx_id"
        )
        .select([
          sql<string>`DATE_TRUNC(${interval}, chain_data_v2.tx.date_block)`.as(
            "date"
          ),
          sql<string>`COUNT(*)`.as("deposit_count"),
          sql<string>`SUM(chain_data_v2.pool_deposit.in_value)`.as(
            "deposit_volume"
          ),
        ])
        .where("chain_data_v2.pool_deposit.contract_address", "=", pool_address)
        .where(sql`DATE(chain_data_v2.tx.date_block)`, ">=", from)
        .where(sql`DATE(chain_data_v2.tx.date_block)`, "<=", to)
        .groupBy(sql`DATE_TRUNC(${interval}, chain_data_v2.tx.date_block)`)
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
      const pool_address = input.poolAddress
        ? getAddress(input.poolAddress)
        : undefined;
      const data = await getSwapPairsData({
        db: ctx.federatedDB,
        poolAddress: pool_address,
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
  featuredPools: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const cacheKey = `featured-pools-${input.limit}`;
      const expiryInSeconds = 60 * 60 * 24;
      const poolModel = new PoolModel(ctx);
      return cacheWithExpiry(cacheKey, expiryInSeconds, () =>
        poolModel.featuredPools(input.limit)
      );
    }),
});

async function invalidateFeaturedPoolsCache() {
  try {
    // Delete all featured-pools cache keys (keyed by limit param)
    const keys = await redis.keys("featured-pools-*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error("[Cache] Failed to invalidate featured pools cache:", err);
  }
}

function getSwapPairsData({
  db,
  poolAddress,
}: {
  db: Kysely<FederatedDB>;
  poolAddress?: `0x${string}`;
}) {
  let query = db
    .selectFrom("chain_data_v2.pool_swap")
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
      "chain_data_v2.pool_swap.contract_address",
      "=",
      poolAddress
    );
  }

  return query.execute();
}
