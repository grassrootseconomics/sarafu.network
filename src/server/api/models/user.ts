import { sql, type Kysely } from "kysely";
import { getAddress } from "viem";
import { type GraphDB } from "~/server/db";
import {
  AccountRoleType,
  AccountType,
  InterfaceType,
  type GasGiftStatus,
} from "~/server/enums";
import { Context } from "../context";

export class UserModel {
  constructor(private db: Kysely<GraphDB>) {}

  async findUserByAddress(address: string) {
    return this.db
      .selectFrom("users")
      .innerJoin("accounts", "users.id", "accounts.user_identifier")
      .where("accounts.blockchain_address", "=", address)
      .select("users.id")
      .executeTakeFirst();
  }
  async updateGasGiftStatus(
    userId: number,
    status: keyof typeof GasGiftStatus
  ) {
    return this.db
      .updateTable("accounts")
      .set({ gas_gift_status: status })
      .where("user_identifier", "=", userId)
      .execute();
  }
  async createUser(address: string) {
    return this.db.transaction().execute(async (trx) => {
      const user = await trx
        .insertInto("users")
        .values({
          interface_type: InterfaceType.APP,
          interface_identifier: address,
          activated: true,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await trx
        .insertInto("personal_information")
        .values({
          user_identifier: user.id,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await trx
        .insertInto("accounts")
        .values({
          user_identifier: user.id,
          blockchain_address: address,
          account_type: AccountType.NON_CUSTODIAL_PERSONAL,
          account_role: AccountRoleType.USER,
        })
        .returning("id")
        .execute();

      return user.id;
    });
  }

  async getUserInfo(userId: number) {
    return this.db
      .selectFrom("users")
      .innerJoin("accounts", "users.id", "accounts.user_identifier")
      .innerJoin(
        "personal_information",
        "users.id",
        "personal_information.user_identifier"
      )
      .where("accounts.user_identifier", "=", userId)
      .select([
        sql<keyof typeof AccountRoleType>`accounts.account_role`.as("role"),
        "users.id",
        "accounts.id as account_id",
        sql<keyof typeof GasGiftStatus>`accounts.gas_gift_status`.as(
          "gas_status"
        ),
        "personal_information.given_names",
        "personal_information.family_name",
        "personal_information.gender",
        "personal_information.year_of_birth",
        "personal_information.location_name",
        "personal_information.geo",
        "accounts.default_voucher",
      ])
      .executeTakeFirstOrThrow();
  }

  async getPersonalInfo(userId: number) {
    return this.db
      .selectFrom("personal_information")
      .where("user_identifier", "=", userId)
      .select(["given_names", "family_name"])
      .executeTakeFirstOrThrow();
  }

  async updateUserProfile(
    userId: number,
    profileData: {
      given_names?: string | null;
      family_name?: string | null;
      year_of_birth?: number | null;
      location_name?: string | null;
      geo?: { x: number; y: number } | null;
      default_voucher?: string | null;
    }
  ) {
    return this.db.transaction().execute(async (trx) => {
      // Update personal_information table
      if (
        profileData.given_names !== undefined ||
        profileData.family_name !== undefined ||
        profileData.year_of_birth !== undefined ||
        profileData.location_name !== undefined ||
        profileData.geo !== undefined
      ) {
        await trx
          .updateTable("personal_information")
          .set({
            ...(profileData.given_names !== undefined && {
              given_names: profileData.given_names,
            }),
            ...(profileData.family_name !== undefined && {
              family_name: profileData.family_name,
            }),
            ...(profileData.year_of_birth !== undefined && {
              year_of_birth: profileData.year_of_birth,
            }),
            ...(profileData.location_name !== undefined && {
              location_name: profileData.location_name,
            }),
            ...(profileData.geo !== undefined && {
              geo: profileData.geo
                ? sql`point(${profileData.geo.x}, ${profileData.geo.y})`
                : null,
            }),
          })
          .where("user_identifier", "=", userId)
          .execute();
      }

      // Update default_voucher in accounts table
      if (profileData.default_voucher !== undefined) {
        await trx
          .updateTable("accounts")
          .set({ default_voucher: profileData.default_voucher })
          .where("user_identifier", "=", userId)
          .execute();
      }
    });
  }
}

// Helper function to get unique voucher addresses
export async function getUniqueVoucherAddresses(ctx: Context, address: string) {
  const vouchers = await ctx.federatedDB
    .selectFrom("chain_data.token_transfer")
    .select("contract_address")
    .where((eb) =>
      eb.or([
        eb("sender_address", "=", address),
        eb("recipient_address", "=", address),
      ])
    )
    .unionAll(
      ctx.federatedDB
        .selectFrom("chain_data.token_mint")
        .select("contract_address")
        .where("recipient_address", "=", address)
    )
    .unionAll(
      ctx.federatedDB
        .selectFrom("chain_data.pool_swap")
        .select("token_out_address as contract_address")
        .where("initiator_address", "=", address)
    )
    .distinct()
    .execute();

  return new Set(vouchers.map((v) => getAddress(v.contract_address)));
}

// Helper function to get vouchers owned by user (from pool_router.tokens)
export async function getOwnedVoucherAddresses(ctx: Context, address: string) {
  // Use pool_router.tokens table which tracks token ownership directly
  // This is simpler and more efficient than using ownership_change

  const ownedTokens = await ctx.federatedDB
    .selectFrom("pool_router.tokens")
    .select("token_address")
    .where("token_owner", "=", address)
    .execute();

  const tokenAddresses = ownedTokens.map((t) => t.token_address);

  if (tokenAddresses.length === 0) {
    return new Set<`0x${string}`>();
  }

  // Filter to only active vouchers from the graph DB
  const activeVouchers = await ctx.graphDB
    .selectFrom("vouchers")
    .select("voucher_address")
    .where("voucher_address", "in", tokenAddresses)
    .where((eb) =>
      eb.or([
        eb("active", "=", true),
        eb("active", "is", null), // Include vouchers with null active status (default)
      ])
    )
    .execute();

  return new Set(activeVouchers.map((v) => getAddress(v.voucher_address)));
}

// Helper function to get pools owned by user (from pool_router.swap_pools)
export async function getOwnedPoolAddresses(ctx: Context, address: string) {
  // Use pool_router.swap_pools table which tracks pool ownership directly
  // This is simpler and more efficient than using ownership_change

  const ownedPools = await ctx.federatedDB
    .selectFrom("pool_router.swap_pools")
    .select("pool_address")
    .where("owner_address", "=", address)
    .execute();

  const poolAddresses = ownedPools.map((p) => p.pool_address);

  if (poolAddresses.length === 0) {
    return new Set<`0x${string}`>();
  }

  // Filter to only non-removed pools from chain_data.pools
  const activePools = await ctx.federatedDB
    .selectFrom("chain_data.pools")
    .select("contract_address")
    .where("contract_address", "in", poolAddresses)
    .where("removed", "=", false)
    .execute();

  return new Set(activePools.map((p) => getAddress(p.contract_address)));
}

export async function isUser(ctx: Context, address: string) {
  // Verify user exists
  const userExists = await ctx.graphDB
    .selectFrom("accounts")
    .where("blockchain_address", "=", address)
    .select("id")
    .executeTakeFirst();
  return Boolean(userExists);
}
