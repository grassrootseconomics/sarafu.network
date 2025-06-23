import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
import { getAddress, isAddress } from "viem";
import { z } from "zod";
import { getVoucherDetails } from "~/components/pools/contract-functions";
import { UserProfileFormSchema } from "~/components/users/schemas";
import { publicClient } from "~/config/viem.config.server";
import { CELO_TOKEN_ADDRESS, CUSD_TOKEN_ADDRESS } from "~/lib/contacts";
import { authenticatedProcedure, router } from "~/server/api/trpc";
import { GasGiftStatus, type AccountRoleType } from "~/server/enums";
import { sendGasRequestedEmbed } from "../../discord";
import { type Context } from "../context";

interface VoucherDetails {
  voucher_address: string;
  symbol: string;
  voucher_name: string;
  icon_url: string | null;
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
        "accounts.default_voucher",
      ])
      .executeTakeFirstOrThrow();

    return {
      ...info,
      default_voucher: info.default_voucher ?? CUSD_TOKEN_ADDRESS,
    };
  }),

  update: authenticatedProcedure
    .input(UserProfileFormSchema)
    .mutation(
      async ({ ctx, input: { default_voucher, role: _role, ...pi } }) => {
        const address = ctx.session?.address;
        if (!address) throw new Error("No user found");
        const user = await ctx.graphDB
          .selectFrom("users")
          .innerJoin("accounts", "users.id", "accounts.user_identifier")
          .where("accounts.blockchain_address", "=", address)
          .select(["users.id as userId", "accounts.id as accountId"])
          .executeTakeFirst();
        if (!user) throw new Error("No user found");
        await ctx.graphDB
          .updateTable("personal_information")
          .set({
            year_of_birth: pi.year_of_birth,
            family_name: pi.family_name,
            given_names: pi.given_names,
            location_name: pi.location_name,
            geo: pi.geo,
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
        return true;
      }
    ),
  vouchers: authenticatedProcedure.query(async ({ ctx }) => {
    const address = ctx.session?.address;
    if (!address || !isAddress(address)) return [];

    // Get unique voucher addresses from all sources
    const voucherAddresses = await getUniqueVoucherAddresses(ctx, address);
    if (!voucherAddresses.size) return [];

    // Get existing voucher details from DB
    const existingVouchers = await ctx.graphDB
      .selectFrom("vouchers")
      .select([
        "voucher_address",
        "symbol",
        "voucher_name",
        "vouchers.icon_url",
      ])
      .where("voucher_address", "in", Array.from(voucherAddresses))
      .execute();

    // Create lookup map for existing vouchers
    const voucherMap = new Map(
      existingVouchers.map((v) => [v.voucher_address, v])
    );

    // Fetch missing voucher details in parallel
    const voucherPromises = Array.from(voucherAddresses).map(
      async (address): Promise<VoucherDetails> => {
        const existing = voucherMap.get(address);
        if (existing) return existing;

        try {
          const details = await getVoucherDetails(publicClient, address);
          return {
            voucher_address: address,
            symbol: details.symbol ?? "Unknown",
            icon_url: null,
            voucher_name: details.name ?? "Unknown",
          };
        } catch (error) {
          console.error(
            `Failed to fetch details for voucher ${address}:`,
            error
          );
          return {
            voucher_address: address,
            symbol: "Error",
            icon_url: null,
            voucher_name: "Failed to load",
          };
        }
      }
    );

    return Promise.all(voucherPromises);
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

      const query = ctx.indexerDB
        .with("all_events", (db) => {
          const tokenTransferSent = db
            .selectFrom("token_transfer")
            .innerJoin("tx", "tx.id", "token_transfer.tx_id")
            .select([
              sql<string>`'token_transfer'`.as("event_type"),
              "tx.date_block",
              "tx.tx_hash",
              "token_transfer.id",
              "token_transfer.tx_id",
              sql<string>`NULL::TEXT`.as("token_in_address"),
              "token_transfer.contract_address as token_out_address",
              "token_transfer.sender_address as from_address",
              "token_transfer.recipient_address as to_address",
              sql<string>`NULL::TEXT`.as("token_in_value"),
              sql<string>`CAST(token_transfer.transfer_value AS TEXT)`.as(
                "token_out_value"
              ),
            ])
            .where("token_transfer.sender_address", "=", accountAddress);

          const tokenTransferReceived = db
            .selectFrom("token_transfer")
            .innerJoin("tx", "tx.id", "token_transfer.tx_id")
            .select([
              sql<string>`'token_transfer'`.as("event_type"),
              "tx.date_block",
              "tx.tx_hash",
              "token_transfer.id",
              "token_transfer.tx_id",
              "token_transfer.contract_address as token_in_address",
              sql<string>`NULL::TEXT`.as("token_out_address"),
              "token_transfer.sender_address as from_address",
              "token_transfer.recipient_address as to_address",
              sql<string>`CAST(token_transfer.transfer_value AS TEXT)`.as(
                "token_in_value"
              ),
              sql<string>`NULL::TEXT`.as("token_out_value"),
            ])
            .where("token_transfer.recipient_address", "=", accountAddress);

          const tokenMint = db
            .selectFrom("token_mint")
            .innerJoin("tx", "tx.id", "token_mint.tx_id")
            .select([
              sql<string>`'token_mint'`.as("event_type"),
              "tx.date_block",
              "tx.tx_hash",
              "token_mint.id",
              "token_mint.tx_id",
              "token_mint.contract_address as token_in_address",
              sql<string>`NULL::TEXT`.as("token_out_address"),
              "token_mint.minter_address as from_address",
              "token_mint.recipient_address as to_address",
              sql<string>`CAST(token_mint.mint_value AS TEXT)`.as(
                "token_in_value"
              ),
              sql<string>`NULL::TEXT`.as("token_out_value"),
            ])
            .where("token_mint.recipient_address", "=", accountAddress);

          const tokenBurn = db
            .selectFrom("token_burn")
            .innerJoin("tx", "tx.id", "token_burn.tx_id")
            .select([
              sql<string>`'token_burn'`.as("event_type"),
              "tx.date_block",
              "tx.tx_hash",
              "token_burn.id",
              "token_burn.tx_id",
              sql<string>`NULL::TEXT`.as("token_in_address"),
              "token_burn.contract_address as token_out_address",
              "token_burn.burner_address as from_address",
              sql<string>`NULL::TEXT`.as("to_address"),
              sql<string>`NULL::TEXT`.as("token_in_value"),
              sql<string>`CAST(token_burn.burn_value AS TEXT)`.as(
                "token_out_value"
              ),
            ])
            .where("token_burn.burner_address", "=", accountAddress);

          const poolDeposit = db
            .selectFrom("pool_deposit")
            .innerJoin("tx", "tx.id", "pool_deposit.tx_id")
            .select([
              sql<string>`'pool_deposit'`.as("event_type"),
              "tx.date_block",
              "tx.tx_hash",
              "pool_deposit.id",
              "pool_deposit.tx_id",
              sql<string>`NULL::TEXT`.as("token_in_address"),
              "pool_deposit.token_in_address as token_out_address",
              "pool_deposit.initiator_address as from_address",
              "pool_deposit.contract_address as to_address",
              sql<string>`NULL::TEXT`.as("token_in_value"),
              sql<string>`CAST(pool_deposit.in_value AS TEXT)`.as(
                "token_out_value"
              ),
            ])
            .where("pool_deposit.initiator_address", "=", accountAddress);

          const poolSwap = db
            .selectFrom("pool_swap")
            .innerJoin("tx", "tx.id", "pool_swap.tx_id")
            .select([
              sql<string>`'pool_swap'`.as("event_type"),
              "tx.date_block",
              "tx.tx_hash",
              "pool_swap.id",
              "pool_swap.tx_id",
              "pool_swap.token_in_address as token_in_address",
              "pool_swap.token_out_address as token_out_address",
              "pool_swap.contract_address as from_address",
              "pool_swap.initiator_address as to_address",
              sql<string>`CAST(pool_swap.in_value AS TEXT)`.as(
                "token_in_value"
              ),
              sql<string>`CAST(pool_swap.out_value AS TEXT)`.as(
                "token_out_value"
              ),
            ])
            .where("pool_swap.initiator_address", "=", accountAddress);

          const faucetGive = db
            .selectFrom("faucet_give")
            .innerJoin("tx", "tx.id", "faucet_give.tx_id")
            .select([
              sql<string>`'faucet_give'`.as("event_type"),
              "tx.date_block",
              "tx.tx_hash",
              "faucet_give.id",
              "faucet_give.tx_id",
              sql<string>`${CELO_TOKEN_ADDRESS}`.as("token_in_address"),
              sql<string>`NULL::TEXT`.as("token_out_address"),
              "faucet_give.contract_address as from_address",
              "faucet_give.recipient_address as to_address",
              sql<string>`CAST(faucet_give.give_value AS TEXT)`.as(
                "token_in_value"
              ),
              sql<string>`NULL::TEXT`.as("token_out_value"),
            ])
            .where("faucet_give.recipient_address", "=", accountAddress);

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

    await ctx.graphDB
      .updateTable("accounts")
      .set({ gas_gift_status: GasGiftStatus.REQUESTED })
      .where("id", "=", account.id)
      .execute();
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
    const name = user.given_names + " " + user.family_name;
    await sendGasRequestedEmbed({
      address,
      name: name ?? "Unknown",
      ip: ctx.ip ?? "Unknown",
    });

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

// Helper function to get unique voucher addresses
async function getUniqueVoucherAddresses(ctx: Context, address: string) {
  const vouchers = await ctx.indexerDB
    .selectFrom("token_transfer")
    .select("contract_address")
    .where((eb) =>
      eb.or([
        eb("sender_address", "=", address),
        eb("recipient_address", "=", address),
      ])
    )
    .unionAll(
      ctx.indexerDB
        .selectFrom("token_mint")
        .select("contract_address")
        .where("recipient_address", "=", address)
    )
    .unionAll(
      ctx.indexerDB
        .selectFrom("pool_swap")
        .select("token_out_address as contract_address")
        .where("initiator_address", "=", address)
    )
    .distinct()
    .execute();

  return new Set(vouchers.map((v) => getAddress(v.contract_address)));
}
