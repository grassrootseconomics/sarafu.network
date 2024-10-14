import { sql, type Kysely } from "kysely";
import { type GraphDB } from "~/server/db";
import { CommodityType } from "~/server/enums";

export class VoucherModel {
  constructor(private db: Kysely<GraphDB>) {}

  async findVoucherByAddress(address: string) {
    return this.db
      .selectFrom("vouchers")
      .where("voucher_address", "=", address)
      .select([
        "id",
        "voucher_address",
        "voucher_name",
        "voucher_description",
        "symbol",
        "voucher_value",
        "voucher_uoa",
        "voucher_type",
        "sink_address",
        "contract_version",
      ])
      .executeTakeFirst();
  }

  async createVoucher(voucherData: {
    symbol: string;
    voucher_name: string;
    voucher_address: string;
    voucher_description: string;
    sink_address: string;
    voucher_email: string;
    voucher_value: string;
    voucher_website: string | null;
    voucher_uoa: string;
    voucher_type: string;
    geo: { x: number; y: number } | null;
    location_name: string;
    internal: boolean;
    contract_version: string;
  }) {
    return this.db.transaction().execute(async (trx) => {
      const voucher = await trx
        .insertInto("vouchers")
        .values(voucherData)
        .returning("id")
        .executeTakeFirstOrThrow();

      return voucher;
    });
  }

  async getVoucherInfo(voucherId: number) {
    return this.db
      .selectFrom("vouchers")
      .where("id", "=", voucherId)
      .select([
        "id",
        "voucher_address",
        "voucher_name",
        "voucher_description",
        "symbol",
        "voucher_value",
        "voucher_uoa",
        "voucher_type",
        "sink_address",
        "voucher_email",
        "voucher_website",
        "geo",
        "location_name",
        "internal",
        "contract_version",
        "created_at",
      ])
      .executeTakeFirstOrThrow();
  }

  async getVoucherIssuers(voucherId: number) {
    return this.db
      .selectFrom("voucher_issuers")
      .innerJoin("personal_information", "voucher_issuers.backer", "personal_information.user_identifier")
      .where("voucher_issuers.voucher", "=", voucherId)
      .select(["backer", "given_names", "family_name"])
      .execute();
  }

  async addVoucherIssuer(voucherId: number, backerId: number) {
    return this.db
      .insertInto("voucher_issuers")
      .values({
        voucher: voucherId,
        backer: backerId,
      })
      .executeTakeFirstOrThrow();
  }

  async getVoucherCommodities(voucherId: number) {
    return this.db
      .selectFrom("product_listings")
      .where("voucher", "=", voucherId)
      .select([
        "id",
        "price",
        "commodity_name",
        "commodity_description",
        sql<keyof typeof CommodityType>`commodity_type`.as("commodity_type"),
        "quantity",
        "frequency",
      ])
      .execute();
  }

  async addVoucherCommodity(commodityData: {
    commodity_name: string;
    commodity_description: string;
    commodity_type: CommodityType;
    voucher: number;
    quantity: number;
    location_name: string;
    frequency: string;
    account: number;
  }) {
    return this.db
      .insertInto("product_listings")
      .values(commodityData)
      .executeTakeFirstOrThrow();
  }

  async updateVoucher(voucherAddress: string, updateData: {
    geo?: { x: number; y: number } | null;
    location_name?: string;
    voucher_description?: string;
    voucher_email?: string | null;
    banner_url?: string | null;
    icon_url?: string | null;
    voucher_website?: string | null;
  }) {
    return this.db
      .updateTable("vouchers")
      .set(updateData)
      .where("voucher_address", "=", voucherAddress)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteVoucher(voucherAddress: string) {
    return this.db.transaction().execute(async (trx) => {
      const voucher = await trx
        .selectFrom("vouchers")
        .where("voucher_address", "=", voucherAddress)
        .select("id")
        .executeTakeFirstOrThrow();

      await trx
        .deleteFrom("transactions")
        .where("voucher_address", "=", voucherAddress)
        .execute();

      await trx
        .deleteFrom("voucher_issuers")
        .where("voucher", "=", voucher.id)
        .execute();

      await trx
        .deleteFrom("voucher_certifications")
        .where("voucher", "=", voucher.id)
        .execute();

      await trx
        .deleteFrom("product_listings")
        .where("voucher", "=", voucher.id)
        .execute();

      return trx
        .deleteFrom("vouchers")
        .where("id", "=", voucher.id)
        .executeTakeFirstOrThrow();
    });
  }
}