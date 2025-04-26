import { sql, type Kysely } from "kysely";
import { type GraphDB } from "~/server/db";
import {
  AccountRoleType,
  AccountType,
  InterfaceType,
  type GasGiftStatus,
} from "~/server/enums";

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
}
