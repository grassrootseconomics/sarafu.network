import { TRPCError } from "@trpc/server";
import { type Kysely, sql } from "kysely";
import { isAddress } from "viem";
import { z } from "zod";
import {
  OnboardingProfileFormSchema,
  UserProfileFormSchema,
} from "~/components/users/schemas";
import { CELO_TOKEN_ADDRESS, CUSD_TOKEN_ADDRESS } from "~/lib/contacts";
import { authenticatedProcedure, router } from "~/server/api/trpc";
import { type GraphDB } from "~/server/db";
import { GasGiftStatus, type AccountRoleType } from "~/server/enums";
import { redis } from "~/utils/cache/kv";
import { sendGasRequestedEmbed } from "../../discord";
import { getUniqueVoucherAddresses } from "../models/user";
import { getIndexedAddresses, loadVouchers } from "../models/voucher";

// Helper function for timezone conversion
const toLocalTime = (column: string) =>
  sql<string>`(${sql.ref(
    column
  )} AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Nairobi')::text`;

// Shared helper for the repeated users+accounts join pattern
function findAccountByAddress(graphDB: Kysely<GraphDB>, address: string) {
  return graphDB
    .selectFrom("users")
    .innerJoin("accounts", "users.id", "accounts.user_identifier")
    .where("accounts.blockchain_address", "=", address)
    .select(["users.id as userId", "accounts.id as accountId"]);
}

// Request gas sponsorship for an account if not already requested/approved
async function requestSocialAccount(
  graphDB: Kysely<GraphDB>,
  accountId: number,
  address: `0x${string}`,
  name: string,
  ip: string
) {
  const account = await graphDB
    .selectFrom("accounts")
    .where("id", "=", accountId)
    .select(["id", "gas_gift_status"])
    .executeTakeFirstOrThrow();

  if (account.gas_gift_status !== GasGiftStatus.NONE) return;

  await graphDB
    .updateTable("accounts")
    .set({ gas_gift_status: GasGiftStatus.REQUESTED })
    .where("id", "=", account.id)
    .execute();

  await sendGasRequestedEmbed({ address, name, ip });
}

export const meRouter = router({
  get: authenticatedProcedure.query(async ({ ctx }) => {
    const address = ctx.session?.address;
    if (!address)
      throw new TRPCError({ code: "BAD_REQUEST", message: "No user found" });
    const info = await ctx.graphDB
      .selectFrom("users")
      .innerJoin("accounts", "users.id", "accounts.user_identifier")
      .innerJoin(
        "personal_information",
        "users.id",
        "personal_information.user_identifier"
      )
      .where("accounts.blockchain_address", "=", address)
      .select([
        sql<keyof typeof AccountRoleType>`accounts.account_role`.as("role"),
        "personal_information.given_names",
        "personal_information.family_name",
        "personal_information.gender",
        "personal_information.year_of_birth",
        "personal_information.location_name",
        "personal_information.geo",
        "personal_information.email",
        "personal_information.date_of_birth",
        "personal_information.bio",
        "personal_information.profile_photo_url",
        "accounts.default_voucher",
        "accounts.onboarding_completed",
      ])
      .executeTakeFirstOrThrow();

    return {
      ...info,
      default_voucher: info.default_voucher ?? CUSD_TOKEN_ADDRESS,
    };
  }),

  update: authenticatedProcedure
    .input(UserProfileFormSchema)
    .mutation(async ({ ctx, input: { default_voucher, ...pi } }) => {
      const address = ctx.session?.address;
      if (!address) throw new TRPCError({ code: "UNAUTHORIZED", message: "No user found" });
      const user = await findAccountByAddress(ctx.graphDB, address).executeTakeFirst();
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "No user found" });
      let dateOfBirth = pi.date_of_birth ?? null;
      if (dateOfBirth) {
        const d = new Date(dateOfBirth);
        if (!Number.isNaN(d.getTime())) {
          dateOfBirth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        }
      }
      await ctx.graphDB
        .updateTable("personal_information")
        .set({
          year_of_birth: pi.year_of_birth,
          family_name: pi.family_name,
          given_names: pi.given_names,
          location_name: pi.location_name,
          geo: pi.geo,
          email: pi.email,
          date_of_birth: dateOfBirth,
          bio: pi.bio,
          profile_photo_url: pi.profile_photo_url,
        })
        .where("user_identifier", "=", user.userId)
        .execute();

      if (user.accountId && default_voucher) {
        await ctx.graphDB
          .updateTable("accounts")
          .set({ default_voucher })
          .where("id", "=", user.accountId)
          .execute();
      }
      await redis.del(`auth:session:${address}`);
      return true;
    }),

  completeOnboarding: authenticatedProcedure
    .input(OnboardingProfileFormSchema)
    .mutation(async ({ ctx, input }) => {
      const address = ctx.session?.address;
      if (!address)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No user found",
        });

      const user = await findAccountByAddress(ctx.graphDB, address).executeTakeFirst();
      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No user found",
        });

      const yearOfBirth = input.date_of_birth.getFullYear();

      await ctx.graphDB
        .updateTable("personal_information")
        .set({
          given_names: input.given_names,
          family_name: input.family_name,
          email: input.email,
          date_of_birth: `${input.date_of_birth.getFullYear()}-${String(input.date_of_birth.getMonth() + 1).padStart(2, "0")}-${String(input.date_of_birth.getDate()).padStart(2, "0")}`,
          year_of_birth: yearOfBirth,
          location_name: input.location_name,
          geo: input.geo,
          bio: input.bio ?? null,
          profile_photo_url: input.profile_photo_url ?? null,
        })
        .where("user_identifier", "=", user.userId)
        .execute();

      await ctx.graphDB
        .updateTable("accounts")
        .set({ onboarding_completed: true })
        .where("id", "=", user.accountId)
        .execute();

      // Auto-request social account (gas sponsorship) for new users
      await requestSocialAccount(
        ctx.graphDB,
        user.accountId,
        address,
        `${input.given_names} ${input.family_name}`,
        ctx.ip ?? "Unknown"
      );

      await redis.del(`auth:session:${address}`);
      return { success: true };
    }),

  updatePrimary: authenticatedProcedure
    .input(
      z.object({
        default_voucher: z.string().refine(isAddress, {
          message: "Invalid voucher address",
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const address = ctx.session?.address;
      if (!address) throw new TRPCError({ code: "UNAUTHORIZED", message: "No user found" });

      const account = await findAccountByAddress(ctx.graphDB, address).executeTakeFirst();

      if (!account?.accountId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }

      await ctx.graphDB
        .updateTable("accounts")
        .set({ default_voucher: input.default_voucher })
        .where("id", "=", account.accountId)
        .execute();

      return { success: true };
    }),

  vouchers: authenticatedProcedure.query(async ({ ctx }) => {
    const address = ctx.session?.address;
    if (!address || !isAddress(address)) return [];

    // Get unique voucher addresses from all sources
    const voucherAddresses = await getUniqueVoucherAddresses(ctx, address);
    if (!voucherAddresses.size) return [];
    const [vouchers, indexedSet] = await Promise.all([
      loadVouchers(ctx, voucherAddresses),
      getIndexedAddresses(ctx.federatedDB),
    ]);
    return vouchers.map((v) => ({
      ...v,
      indexed: indexedSet.has(v.voucher_address.toLowerCase()),
    }));
  }),
  events: authenticatedProcedure
    .input(
      z.object({
        limit: z.number().min(1).nullish(),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const accountAddress = ctx.session.address;
      const limit = input.limit ?? 20;
      const cursor = input.cursor ?? 0;

      const query = ctx.federatedDB
        .with("all_events", (db) => {
          const tokenTransferSent = db
            .selectFrom("chain_data_v2.token_transfer")
            .innerJoin(
              "chain_data_v2.tx",
              "chain_data_v2.tx.id",
              "chain_data_v2.token_transfer.tx_id"
            )
            .select([
              sql<string>`'token_transfer'`.as("event_type"),
              toLocalTime("chain_data_v2.tx.date_block").as("date_block"),
              "chain_data_v2.tx.tx_hash",
              "chain_data_v2.token_transfer.id",
              "chain_data_v2.token_transfer.tx_id",
              sql<string>`NULL::TEXT`.as("token_in_address"),
              "chain_data_v2.token_transfer.contract_address as token_out_address",
              "chain_data_v2.token_transfer.sender_address as from_address",
              "chain_data_v2.token_transfer.recipient_address as to_address",
              sql<string>`NULL::TEXT`.as("token_in_value"),
              sql<string>`CAST(chain_data_v2.token_transfer.transfer_value AS TEXT)`.as(
                "token_out_value"
              ),
            ])
            .where(
              "chain_data_v2.token_transfer.sender_address",
              "=",
              accountAddress
            );

          const tokenTransferReceived = db
            .selectFrom("chain_data_v2.token_transfer")
            .innerJoin(
              "chain_data_v2.tx",
              "chain_data_v2.tx.id",
              "chain_data_v2.token_transfer.tx_id"
            )
            .select([
              sql<string>`'token_transfer'`.as("event_type"),
              toLocalTime("chain_data_v2.tx.date_block").as("date_block"),
              "chain_data_v2.tx.tx_hash",
              "chain_data_v2.token_transfer.id",
              "chain_data_v2.token_transfer.tx_id",
              "chain_data_v2.token_transfer.contract_address as token_in_address",
              sql<string>`NULL::TEXT`.as("token_out_address"),
              "chain_data_v2.token_transfer.sender_address as from_address",
              "chain_data_v2.token_transfer.recipient_address as to_address",
              sql<string>`CAST(chain_data_v2.token_transfer.transfer_value AS TEXT)`.as(
                "token_in_value"
              ),
              sql<string>`NULL::TEXT`.as("token_out_value"),
            ])
            .where(
              "chain_data_v2.token_transfer.recipient_address",
              "=",
              accountAddress
            );

          const tokenMint = db
            .selectFrom("chain_data_v2.token_mint")
            .innerJoin(
              "chain_data_v2.tx",
              "chain_data_v2.tx.id",
              "chain_data_v2.token_mint.tx_id"
            )
            .select([
              sql<string>`'token_mint'`.as("event_type"),
              toLocalTime("chain_data_v2.tx.date_block").as("date_block"),
              "chain_data_v2.tx.tx_hash",
              "chain_data_v2.token_mint.id",
              "chain_data_v2.token_mint.tx_id",
              "chain_data_v2.token_mint.contract_address as token_in_address",
              sql<string>`NULL::TEXT`.as("token_out_address"),
              "chain_data_v2.token_mint.minter_address as from_address",
              "chain_data_v2.token_mint.recipient_address as to_address",
              sql<string>`CAST(chain_data_v2.token_mint.mint_value AS TEXT)`.as(
                "token_in_value"
              ),
              sql<string>`NULL::TEXT`.as("token_out_value"),
            ])
            .where(
              "chain_data_v2.token_mint.recipient_address",
              "=",
              accountAddress
            );

          const tokenBurn = db
            .selectFrom("chain_data_v2.token_burn")
            .innerJoin(
              "chain_data_v2.tx",
              "chain_data_v2.tx.id",
              "chain_data_v2.token_burn.tx_id"
            )
            .select([
              sql<string>`'token_burn'`.as("event_type"),
              toLocalTime("chain_data_v2.tx.date_block").as("date_block"),
              "chain_data_v2.tx.tx_hash",
              "chain_data_v2.token_burn.id",
              "chain_data_v2.token_burn.tx_id",
              sql<string>`NULL::TEXT`.as("token_in_address"),
              "chain_data_v2.token_burn.contract_address as token_out_address",
              "chain_data_v2.token_burn.burner_address as from_address",
              sql<string>`NULL::TEXT`.as("to_address"),
              sql<string>`NULL::TEXT`.as("token_in_value"),
              sql<string>`CAST(chain_data_v2.token_burn.burn_value AS TEXT)`.as(
                "token_out_value"
              ),
            ])
            .where("chain_data_v2.token_burn.burner_address", "=", accountAddress);

          const poolDeposit = db
            .selectFrom("chain_data_v2.pool_deposit")
            .innerJoin(
              "chain_data_v2.tx",
              "chain_data_v2.tx.id",
              "chain_data_v2.pool_deposit.tx_id"
            )
            .select([
              sql<string>`'pool_deposit'`.as("event_type"),
              toLocalTime("chain_data_v2.tx.date_block").as("date_block"),
              "chain_data_v2.tx.tx_hash",
              "chain_data_v2.pool_deposit.id",
              "chain_data_v2.pool_deposit.tx_id",
              sql<string>`NULL::TEXT`.as("token_in_address"),
              "chain_data_v2.pool_deposit.token_in_address as token_out_address",
              "chain_data_v2.pool_deposit.initiator_address as from_address",
              "chain_data_v2.pool_deposit.contract_address as to_address",
              sql<string>`NULL::TEXT`.as("token_in_value"),
              sql<string>`CAST(chain_data_v2.pool_deposit.in_value AS TEXT)`.as(
                "token_out_value"
              ),
            ])
            .where(
              "chain_data_v2.pool_deposit.initiator_address",
              "=",
              accountAddress
            );

          const poolSwap = db
            .selectFrom("chain_data_v2.pool_swap")
            .innerJoin(
              "chain_data_v2.tx",
              "chain_data_v2.tx.id",
              "chain_data_v2.pool_swap.tx_id"
            )
            .select([
              sql<string>`'pool_swap'`.as("event_type"),
              toLocalTime("chain_data_v2.tx.date_block").as("date_block"),
              "chain_data_v2.tx.tx_hash",
              "chain_data_v2.pool_swap.id",
              "chain_data_v2.pool_swap.tx_id",
              "chain_data_v2.pool_swap.token_in_address as token_in_address",
              "chain_data_v2.pool_swap.token_out_address as token_out_address",
              "chain_data_v2.pool_swap.contract_address as from_address",
              "chain_data_v2.pool_swap.initiator_address as to_address",
              sql<string>`CAST(chain_data_v2.pool_swap.in_value AS TEXT)`.as(
                "token_in_value"
              ),
              sql<string>`CAST(chain_data_v2.pool_swap.out_value AS TEXT)`.as(
                "token_out_value"
              ),
            ])
            .where(
              "chain_data_v2.pool_swap.initiator_address",
              "=",
              accountAddress
            );

          const faucetGive = db
            .selectFrom("chain_data_v2.faucet_give")
            .innerJoin(
              "chain_data_v2.tx",
              "chain_data_v2.tx.id",
              "chain_data_v2.faucet_give.tx_id"
            )
            .select([
              sql<string>`'faucet_give'`.as("event_type"),
              toLocalTime("chain_data_v2.tx.date_block").as("date_block"),
              "chain_data_v2.tx.tx_hash",
              "chain_data_v2.faucet_give.id",
              "chain_data_v2.faucet_give.tx_id",
              sql<string>`${CELO_TOKEN_ADDRESS}`.as("token_in_address"),
              sql<string>`NULL::TEXT`.as("token_out_address"),
              "chain_data_v2.faucet_give.contract_address as from_address",
              "chain_data_v2.faucet_give.recipient_address as to_address",
              sql<string>`CAST(chain_data_v2.faucet_give.give_value AS TEXT)`.as(
                "token_in_value"
              ),
              sql<string>`NULL::TEXT`.as("token_out_value"),
            ])
            .where(
              "chain_data_v2.faucet_give.recipient_address",
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

      return {
        events,
        nextCursor: events.length === limit ? cursor + limit : undefined,
      };
    }),
  requestGas: authenticatedProcedure.mutation(async ({ ctx }) => {
    const address = ctx.session?.address;
    if (!address || !isAddress(address)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid address",
      });
    }
    const account = await ctx.graphDB
      .selectFrom("accounts")
      .where("blockchain_address", "=", address)
      .select(["id", "gas_gift_status"])
      .executeTakeFirstOrThrow();
    if (account.gas_gift_status === GasGiftStatus.REJECTED)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Sorry your request has been rejected.",
      });
    if (account.gas_gift_status === GasGiftStatus.REQUESTED)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Sorry your request is pending.",
      });
    if (account.gas_gift_status === GasGiftStatus.APPROVED) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You are already approved.",
      });
    }

    const user = await ctx.graphDB
      .selectFrom("users")
      .innerJoin("accounts", "users.id", "accounts.user_identifier")
      .innerJoin(
        "personal_information",
        "users.id",
        "personal_information.user_identifier"
      )
      .where("accounts.blockchain_address", "=", address)
      .select([
        "personal_information.given_names",
        "personal_information.family_name",
      ])
      .executeTakeFirstOrThrow();
    const name = `${user.given_names} ${user.family_name}`;

    await requestSocialAccount(
      ctx.graphDB,
      account.id,
      address,
      name ?? "Unknown",
      ctx.ip ?? "Unknown"
    );

    return {
      message: "Request sent successfully.",
    };
  }),
  gasStatus: authenticatedProcedure.query(async ({ ctx }) => {
    const address = ctx.session?.address;
    if (!address || !isAddress(address)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid address",
      });
    }
    const account = await ctx.graphDB
      .selectFrom("accounts")
      .where("blockchain_address", "=", address)
      .select(["id", "gas_gift_status"])
      .executeTakeFirstOrThrow();
    return account.gas_gift_status as keyof typeof GasGiftStatus;
  }),
});
