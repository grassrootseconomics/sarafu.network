import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
import { getAddress, isAddress } from "viem";
import { z } from "zod";
import { CELO_TOKEN_ADDRESS } from "~/lib/contacts";
import { publicProcedure, router } from "~/server/api/trpc";
import { cacheQuery } from "~/utils/cache/cacheQuery";
// import { addressSchema } from "~/utils/zod"; // Not currently used
import { NO_USER_FOUND_ERROR } from "~/server/errors";
import {
  getOwnedPoolAddresses,
  getOwnedVoucherAddresses,
  getUniqueVoucherAddresses,
  isUser,
} from "../models/user";
import { loadVouchers } from "../models/voucher";

/**
 * Comprehensive user statistics including trading partners, transaction counts,
 * voucher balances, and swap activity
 */
interface UserStats {
  /** Count of unique addresses this user sent tokens to */
  uniquePartnersOutward: number;
  /** Count of unique addresses this user received tokens from */
  uniquePartnersInward: number;
  /** Total number of outgoing transactions (transfers, burns, deposits) */
  transactionsOut: number;
  /** Total number of incoming transactions (transfers, mints, faucet) */
  transactionsIn: number;
  /** Total number of swap transactions initiated by the user */
  totalSwaps: number;

  /** Count of unique voucher addresses held by the user */
  totalVouchersHeld: number;
}

export const profileRouter = router({
  getPublicProfile: publicProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
      })
    )
    .query(
      cacheQuery(
        600, // 10 minutes
        async ({ ctx, input }) => {
          const address = getAddress(input.address);

          const user = await ctx.graphDB
            .selectFrom("users")
            .innerJoin("accounts", "users.id", "accounts.user_identifier")
            .leftJoin(
              "personal_information",
              "users.id",
              "personal_information.user_identifier"
            )
            .where("accounts.blockchain_address", "=", address)
            .select([
              "accounts.blockchain_address as address",
            ])
            .executeTakeFirst();

          if (!user) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found",
            });
          }

          return {
            address: user.address,
            avatar: null, // Avatar URL can be added when available
          };
        },
        {
          tags: ({ input }) => [`user:${getAddress(input.address)}`],
        }
      )
    ),

  /**
   * Get comprehensive user statistics
   *
   * Returns trading partner counts, transaction totals, voucher balances, and swap activity.
   * This endpoint provides a holistic view of a user's on-chain activity.
   *
   * @cached 15 minutes with tag-based invalidation
   * @public No authentication required
   */
  getUserStats: publicProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
      })
    )
    .query(
      cacheQuery(
        900, // 15 minutes
        async ({ ctx, input }): Promise<UserStats> => {
          const address = getAddress(input.address);

          // Verify user exists in graph DB
          const userExists = await ctx.graphDB
            .selectFrom("accounts")
            .where("blockchain_address", "=", address)
            .select("id")
            .executeTakeFirst();

          if (!userExists) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found",
            });
          }

          // Execute all queries in parallel for optimal performance
          const [
            uniquePartnersOutward,
            uniquePartnersInward,
            transactionsOut,
            transactionsIn,
            totalSwaps,
            totalVouchersHeld
          ] = await Promise.all([
            // 1. Unique outward trading partners (sent to)
            ctx.federatedDB
              .selectFrom("chain_data.token_transfer")
              .select(
                sql<string>`COUNT(DISTINCT recipient_address)`.as("count")
              )
              .where("sender_address", "=", address)
              .executeTakeFirst()
              .then((result) => parseInt(result?.count ?? "0", 10)),

            // 2. Unique inward trading partners (received from)
            ctx.federatedDB
              .selectFrom("chain_data.token_transfer")
              .select(sql<string>`COUNT(DISTINCT sender_address)`.as("count"))
              .where("recipient_address", "=", address)
              .executeTakeFirst()
              .then((result) => parseInt(result?.count ?? "0", 10)),

            // 3. Total outgoing transactions (transfers sent + burns + pool deposits)
            Promise.all([
              // Transfers sent
              ctx.federatedDB
                .selectFrom("chain_data.token_transfer")
                .select(sql<string>`COUNT(*)`.as("count"))
                .where("sender_address", "=", address)
                .executeTakeFirst()
                .then((result) => parseInt(result?.count ?? "0", 10)),
              // Burns
              ctx.federatedDB
                .selectFrom("chain_data.token_burn")
                .select(sql<string>`COUNT(*)`.as("count"))
                .where("burner_address", "=", address)
                .executeTakeFirst()
                .then((result) => parseInt(result?.count ?? "0", 10)),
              // Pool deposits
              ctx.federatedDB
                .selectFrom("chain_data.pool_deposit")
                .select(sql<string>`COUNT(*)`.as("count"))
                .where("initiator_address", "=", address)
                .executeTakeFirst()
                .then((result) => parseInt(result?.count ?? "0", 10)),
            ]).then(
              ([transfers, burns, deposits]) => transfers + burns + deposits
            ),

            // 4. Total incoming transactions (transfers received + mints + faucet gives)
            Promise.all([
              // Transfers received
              ctx.federatedDB
                .selectFrom("chain_data.token_transfer")
                .select(sql<string>`COUNT(*)`.as("count"))
                .where("recipient_address", "=", address)
                .executeTakeFirst()
                .then((result) => parseInt(result?.count ?? "0", 10)),
              // Mints
              ctx.federatedDB
                .selectFrom("chain_data.token_mint")
                .select(sql<string>`COUNT(*)`.as("count"))
                .where("recipient_address", "=", address)
                .executeTakeFirst()
                .then((result) => parseInt(result?.count ?? "0", 10)),
              // Faucet gives
              ctx.federatedDB
                .selectFrom("chain_data.faucet_give")
                .select(sql<string>`COUNT(*)`.as("count"))
                .where("recipient_address", "=", address)
                .executeTakeFirst()
                .then((result) => parseInt(result?.count ?? "0", 10)),
            ]).then(
              ([transfers, burns, deposits]) => transfers + burns + deposits
            ),

            // 5. Total swaps
            ctx.federatedDB
              .selectFrom("chain_data.pool_swap")
              .select(sql<number>`COUNT(*)`.as("count"))
              .where("initiator_address", "=", address)
              .executeTakeFirst()
              .then((result) => result?.count ?? 0),

            // 6. Voucher held

            getUniqueVoucherAddresses(ctx, address).then(addresses => addresses.size)
          ]);

          return {
            uniquePartnersOutward,
            uniquePartnersInward,
            transactionsOut,
            transactionsIn,
            totalSwaps,
            totalVouchersHeld
          };
        },
        {
          tags: ({ input }) => [`user:${getAddress(input.address)}:stats`],
          bypass: () => true,
        }
      )
    ),

  getUserTransactions: publicProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.number().nullish(),
      })
    )
    .query(
      cacheQuery(
        300, // 5 minutes
        async ({ ctx, input }) => {
          const accountAddress = getAddress(input.address);
          const limit = input.limit;
          const cursor = input.cursor ?? 0;

          // Verify user exists
          const userExists = await ctx.graphDB
            .selectFrom("accounts")
            .where("blockchain_address", "=", accountAddress)
            .select("id")
            .executeTakeFirst();

          if (!userExists) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found",
            });
          }

          // Helper function for timezone conversion
          const toLocalTime = (column: string) =>
            sql<string>`(${sql.ref(
              column
            )} AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Nairobi')::text`;

          // Get all transaction events for this user (same as me.events)
          /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
          const query = ctx.federatedDB
            .with("all_events", (db) => {
              const tokenTransferSent = db
                .selectFrom("chain_data.token_transfer")
                .innerJoin(
                  "chain_data.tx",
                  "chain_data.tx.id",
                  "chain_data.token_transfer.tx_id"
                )
                .select([
                  sql<string>`'token_transfer'`.as("event_type"),
                  toLocalTime("chain_data.tx.date_block").as("date_block"),
                  "chain_data.tx.tx_hash",
                  "chain_data.token_transfer.id",
                  "chain_data.token_transfer.tx_id",
                  sql<string>`NULL::TEXT`.as("token_in_address"),
                  "chain_data.token_transfer.contract_address as token_out_address",
                  "chain_data.token_transfer.sender_address as from_address",
                  "chain_data.token_transfer.recipient_address as to_address",
                  sql<string>`NULL::TEXT`.as("token_in_value"),
                  sql<string>`CAST(chain_data.token_transfer.transfer_value AS TEXT)`.as(
                    "token_out_value"
                  ),
                ])
                .where(
                  "chain_data.token_transfer.sender_address",
                  "=",
                  accountAddress
                );

              const tokenTransferReceived = db
                .selectFrom("chain_data.token_transfer")
                .innerJoin(
                  "chain_data.tx",
                  "chain_data.tx.id",
                  "chain_data.token_transfer.tx_id"
                )
                .select([
                  sql<string>`'token_transfer'`.as("event_type"),
                  toLocalTime("chain_data.tx.date_block").as("date_block"),
                  "chain_data.tx.tx_hash",
                  "chain_data.token_transfer.id",
                  "chain_data.token_transfer.tx_id",
                  "chain_data.token_transfer.contract_address as token_in_address",
                  sql<string>`NULL::TEXT`.as("token_out_address"),
                  "chain_data.token_transfer.sender_address as from_address",
                  "chain_data.token_transfer.recipient_address as to_address",
                  sql<string>`CAST(chain_data.token_transfer.transfer_value AS TEXT)`.as(
                    "token_in_value"
                  ),
                  sql<string>`NULL::TEXT`.as("token_out_value"),
                ])
                .where(
                  "chain_data.token_transfer.recipient_address",
                  "=",
                  accountAddress
                );

              const tokenMint = db
                .selectFrom("chain_data.token_mint")
                .innerJoin(
                  "chain_data.tx",
                  "chain_data.tx.id",
                  "chain_data.token_mint.tx_id"
                )
                .select([
                  sql<string>`'token_mint'`.as("event_type"),
                  toLocalTime("chain_data.tx.date_block").as("date_block"),
                  "chain_data.tx.tx_hash",
                  "chain_data.token_mint.id",
                  "chain_data.token_mint.tx_id",
                  "chain_data.token_mint.contract_address as token_in_address",
                  sql<string>`NULL::TEXT`.as("token_out_address"),
                  "chain_data.token_mint.minter_address as from_address",
                  "chain_data.token_mint.recipient_address as to_address",
                  sql<string>`CAST(chain_data.token_mint.mint_value AS TEXT)`.as(
                    "token_in_value"
                  ),
                  sql<string>`NULL::TEXT`.as("token_out_value"),
                ])
                .where(
                  "chain_data.token_mint.recipient_address",
                  "=",
                  accountAddress
                );

              const tokenBurn = db
                .selectFrom("chain_data.token_burn")
                .innerJoin(
                  "chain_data.tx",
                  "chain_data.tx.id",
                  "chain_data.token_burn.tx_id"
                )
                .select([
                  sql<string>`'token_burn'`.as("event_type"),
                  toLocalTime("chain_data.tx.date_block").as("date_block"),
                  "chain_data.tx.tx_hash",
                  "chain_data.token_burn.id",
                  "chain_data.token_burn.tx_id",
                  sql<string>`NULL::TEXT`.as("token_in_address"),
                  "chain_data.token_burn.contract_address as token_out_address",
                  "chain_data.token_burn.burner_address as from_address",
                  sql<string>`NULL::TEXT`.as("to_address"),
                  sql<string>`NULL::TEXT`.as("token_in_value"),
                  sql<string>`CAST(chain_data.token_burn.burn_value AS TEXT)`.as(
                    "token_out_value"
                  ),
                ])
                .where(
                  "chain_data.token_burn.burner_address",
                  "=",
                  accountAddress
                );

              const poolDeposit = db
                .selectFrom("chain_data.pool_deposit")
                .innerJoin(
                  "chain_data.tx",
                  "chain_data.tx.id",
                  "chain_data.pool_deposit.tx_id"
                )
                .select([
                  sql<string>`'pool_deposit'`.as("event_type"),
                  toLocalTime("chain_data.tx.date_block").as("date_block"),
                  "chain_data.tx.tx_hash",
                  "chain_data.pool_deposit.id",
                  "chain_data.pool_deposit.tx_id",
                  sql<string>`NULL::TEXT`.as("token_in_address"),
                  "chain_data.pool_deposit.token_in_address as token_out_address",
                  "chain_data.pool_deposit.initiator_address as from_address",
                  "chain_data.pool_deposit.contract_address as to_address",
                  sql<string>`NULL::TEXT`.as("token_in_value"),
                  sql<string>`CAST(chain_data.pool_deposit.in_value AS TEXT)`.as(
                    "token_out_value"
                  ),
                ])
                .where(
                  "chain_data.pool_deposit.initiator_address",
                  "=",
                  accountAddress
                );

              const poolSwap = db
                .selectFrom("chain_data.pool_swap")
                .innerJoin(
                  "chain_data.tx",
                  "chain_data.tx.id",
                  "chain_data.pool_swap.tx_id"
                )
                .select([
                  sql<string>`'pool_swap'`.as("event_type"),
                  toLocalTime("chain_data.tx.date_block").as("date_block"),
                  "chain_data.tx.tx_hash",
                  "chain_data.pool_swap.id",
                  "chain_data.pool_swap.tx_id",
                  "chain_data.pool_swap.token_in_address as token_in_address",
                  "chain_data.pool_swap.token_out_address as token_out_address",
                  "chain_data.pool_swap.contract_address as from_address",
                  "chain_data.pool_swap.initiator_address as to_address",
                  sql<string>`CAST(chain_data.pool_swap.in_value AS TEXT)`.as(
                    "token_in_value"
                  ),
                  sql<string>`CAST(chain_data.pool_swap.out_value AS TEXT)`.as(
                    "token_out_value"
                  ),
                ])
                .where(
                  "chain_data.pool_swap.initiator_address",
                  "=",
                  accountAddress
                );

              const faucetGive = db
                .selectFrom("chain_data.faucet_give")
                .innerJoin(
                  "chain_data.tx",
                  "chain_data.tx.id",
                  "chain_data.faucet_give.tx_id"
                )
                .select([
                  sql<string>`'faucet_give'`.as("event_type"),
                  toLocalTime("chain_data.tx.date_block").as("date_block"),
                  "chain_data.tx.tx_hash",
                  "chain_data.faucet_give.id",
                  "chain_data.faucet_give.tx_id",
                  sql<string>`${CELO_TOKEN_ADDRESS}`.as("token_in_address"),
                  sql<string>`NULL::TEXT`.as("token_out_address"),
                  "chain_data.faucet_give.contract_address as from_address",
                  "chain_data.faucet_give.recipient_address as to_address",
                  sql<string>`CAST(chain_data.faucet_give.give_value AS TEXT)`.as(
                    "token_in_value"
                  ),
                  sql<string>`NULL::TEXT`.as("token_out_value"),
                ])
                .where(
                  "chain_data.faucet_give.recipient_address",
                  "=",
                  accountAddress
                );

              return tokenTransferSent
                .unionAll(tokenTransferReceived)
                .unionAll(tokenMint)
                .unionAll(tokenBurn)
                .unionAll(poolDeposit)
                .unionAll(poolSwap)
                .unionAll(faucetGive);
            })
            .selectFrom("all_events")
            .selectAll()
            .orderBy("date_block", "desc")
            .orderBy("id", "desc")
            .limit(limit)
            .offset(cursor);

          const events = await query.execute();
          /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

          return {
            transactions: events,
            nextCursor: events.length === limit ? cursor + limit : undefined,
          };
        },
        {
          tags: ({ input }) => [
            `user:${getAddress(input.address)}:transactions`,
          ],
        }
      )
    ),
  getUserVouchers: publicProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
      })
    )
    .query(
      cacheQuery(
        60, // 1 minute
        async ({ ctx, input }) => {
          const address = getAddress(input.address);

          // Verify user exists
          const userExists = await isUser(ctx, address);
          if (!userExists) throw NO_USER_FOUND_ERROR;

          // Get vouchers where user is the issuer/owner
          const voucherAddresses = await getUniqueVoucherAddresses(
            ctx,
            address
          );
          if (!voucherAddresses.size) return [];
          return loadVouchers(ctx, voucherAddresses);
        }
      )
    ),
  getUserOwnedVouchers: publicProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
      })
    )
    .query(
      cacheQuery(
        600, // 10 minutes
        async ({ ctx, input }) => {
          const address = getAddress(input.address);

          // Verify user exists
          const userExists = await isUser(ctx, address);
          if (!userExists) throw NO_USER_FOUND_ERROR;

          // Get vouchers where user is the issuer/owner
          const voucherAddresses = await getOwnedVoucherAddresses(ctx, address);
          if (!voucherAddresses.size) return [];
          return loadVouchers(ctx, voucherAddresses);
        },
        {
          tags: ({ input }) => [
            `user:${getAddress(input.address)}:owned-vouchers`,
          ],
        }
      )
    ),

  getUserPools: publicProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
      })
    )
    .query(
      cacheQuery(
        600, // 10 minutes
        async ({ ctx, input }) => {
          const address = getAddress(input.address);

          // Verify user exists
          const userExists = await ctx.graphDB
            .selectFrom("accounts")
            .where("blockchain_address", "=", address)
            .select("id")
            .executeTakeFirst();

          if (!userExists) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found",
            });
          }

          // Get pools where user is the current owner (via chain_data.ownership_change)
          const poolAddresses = await getOwnedPoolAddresses(ctx, address);
          if (!poolAddresses.size) return [];

          // Get pool details from database
          const pools = await ctx.federatedDB
            .selectFrom("chain_data.pools as p")
            .leftJoin(
              "sarafu_network.swap_pools as sp",
              "sp.pool_address",
              "p.contract_address"
            )
            .where("p.contract_address", "in", Array.from(poolAddresses))
            .where("p.removed", "=", false)
            .select([
              "p.contract_address",
              "p.pool_name",
              "p.pool_symbol",
              "sp.swap_pool_description",
              "sp.banner_url",
            ])
            .execute();

          return pools.map((pool) => ({
            contract_address: pool.contract_address,
            pool_name: pool.pool_name,
            pool_symbol: pool.pool_symbol,
            description: pool.swap_pool_description ?? "",
            banner_url: pool.banner_url ?? null,
          }));
        },
        {
          tags: ({ input }) => [
            `user:${getAddress(input.address)}:owned-pools`,
          ],
        }
      )
    ),

  getUserReports: publicProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.number().nullish(),
      })
    )
    .query(
      cacheQuery(
        300, // 5 minutes
        async ({ ctx, input }) => {
          const address = getAddress(input.address);
          const limit = input.limit;
          const cursor = input.cursor ?? 0;

          // Verify user exists
          const userExists = await ctx.graphDB
            .selectFrom("accounts")
            .where("blockchain_address", "=", address)
            .select("id")
            .executeTakeFirst();

          if (!userExists) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found",
            });
          }

          // Get reports created by this user
          const reports = await ctx.graphDB
            .selectFrom("field_reports as fr")
            .innerJoin("users as u", "u.id", "fr.created_by")
            .innerJoin("accounts as a", "a.user_identifier", "u.id")
            .where("a.blockchain_address", "=", address)
            .select([
              "fr.id",
              "fr.title",
              "fr.description",
              "fr.report",
              "fr.image_url",
              "fr.status",
              "fr.created_at",
              "fr.updated_at",
              "fr.period_from",
              "fr.period_to",
              "fr.location",
            ])
            .orderBy("fr.created_at", "desc")
            .limit(limit)
            .offset(cursor)
            .execute();

          return {
            reports,
            nextCursor: reports.length === limit ? cursor + limit : undefined,
          };
        },
        {
          tags: ({ input }) => [`user:${getAddress(input.address)}:reports`],
        }
      )
    ),
});
