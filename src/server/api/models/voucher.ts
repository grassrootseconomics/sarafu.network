import { sql, type Kysely } from "kysely";
import { type GraphDB, type IndexerDB } from "~/server/db";
import { type CommodityType } from "~/server/enums";
import { type UpdateVoucherInput } from "../routers/voucher";

export class VoucherModel {
  private graphDB: Kysely<GraphDB>;
  private indexerDB: Kysely<IndexerDB>;
  constructor({
    graphDB,
    indexerDB,
  }: {
    graphDB: Kysely<GraphDB>;
    indexerDB: Kysely<IndexerDB>;
  }) {
    this.graphDB = graphDB;
    this.indexerDB = indexerDB;
  }
  async listVouchers() {
    return this.graphDB
      .selectFrom("vouchers")
      .selectAll()
      .execute();
  }  
  async findVoucherByAddress(address: string) {
    return this.graphDB
      .selectFrom("vouchers")
      .where("voucher_address", "=", address)
      .select([
        "id",
        "voucher_address",
        "voucher_name",
        "voucher_description",
        "geo",
        "location_name",
        "voucher_email",
        "voucher_website",
        "voucher_type",
        "voucher_uoa",
        "banner_url",
        "icon_url",
        "created_at",
        "voucher_value",
        "sink_address",
        "symbol",
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
    voucher_value: number;
    voucher_website: string | undefined;
    voucher_uoa: string;
    voucher_type: string;
    geo: { x: number; y: number } | undefined;
    location_name: string;
    internal: boolean;
    contract_version: string;
  }) {
    return this.graphDB.transaction().execute(async (trx) => {
      const voucher = await trx
        .insertInto("vouchers")
        .values({
          symbol: voucherData.symbol,
          voucher_name: voucherData.voucher_name,
          voucher_address: voucherData.voucher_address,
          voucher_description: voucherData.voucher_description,
          sink_address: voucherData.sink_address,
          voucher_email: voucherData.voucher_email,
          voucher_value: voucherData.voucher_value,
          voucher_website: voucherData.voucher_website,
          voucher_uoa: voucherData.voucher_uoa,
          voucher_type: voucherData.voucher_type,
          geo: voucherData.geo,
          location_name: voucherData.location_name,
          internal: voucherData.internal,
          contract_version: voucherData.contract_version,
        })
        .returning([
          "id",
          "voucher_address",
          "voucher_name",
          "symbol",
          "voucher_description",
        ])
        .executeTakeFirstOrThrow();

      return voucher;
    });
  }

  async getVoucherInfo(voucherId: number) {
    return this.graphDB
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
    return this.graphDB
      .selectFrom("voucher_issuers")
      .select(["backer"])
      .where("voucher_issuers.voucher", "=", voucherId)
      .leftJoin(
        "personal_information",
        "backer",
        "personal_information.user_identifier"
      )
      .select(["given_names", "family_name"])
      .execute();
  }

  async addVoucherIssuer(voucherId: number, backerId: number) {
    return this.graphDB
      .insertInto("voucher_issuers")
      .values({
        voucher: voucherId,
        backer: backerId,
      })
      .executeTakeFirstOrThrow();
  }

  async getVoucherCommodities(voucherId: number) {
    return this.graphDB
      .selectFrom("product_listings")
      .select([
        "id",
        "price",
        "commodity_name",
        "commodity_description",
        sql<keyof typeof CommodityType>`commodity_type`.as("commodity_type"),
        "quantity",
        "product_listings.voucher as voucher_id",
        "frequency",
      ])
      .where("voucher", "=", voucherId)
      .execute();
  }

  async addVoucherCommodity(commodityData: {
    commodity_name: string;
    commodity_description: string;
    commodity_type: keyof typeof CommodityType;
    voucher: number;
    quantity: number;
    location_name: string;
    frequency: string;
    account: number;
  }) {
    return this.graphDB
      .insertInto("product_listings")
      .values(commodityData)
      .executeTakeFirstOrThrow();
  }

  async updateVoucher(input: UpdateVoucherInput) {
    return this.graphDB
      .updateTable("vouchers")
      .set({
        geo: input.geo,
        location_name: input.locationName ?? " ",
        voucher_description: input.voucherDescription,
        voucher_email: input.voucherEmail,
        banner_url: input.bannerUrl,
        icon_url: input.iconUrl,
        voucher_website: input.voucherWebsite,
      })
      .where("voucher_address", "=", input.voucherAddress)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteVoucher(voucherAddress: string) {
    return this.graphDB.transaction().execute(async (trx) => {
      const voucher = await trx
        .selectFrom("vouchers")
        .where("voucher_address", "=", voucherAddress)
        .select([
          "id",
          "voucher_address",
          "voucher_name",
          "symbol",
          "voucher_description",
        ])
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

      await trx
        .deleteFrom("vouchers")
        .where("id", "=", voucher.id)
        .executeTakeFirstOrThrow();
      return voucher;
    });
  }

  getVoucherHolders(voucherAddress: string) {
    return this.indexerDB
      .selectFrom("token_transfer")
      .leftJoin("tx", "tx.id", "token_transfer.tx_id")
      .distinctOn("recipient_address")
      .where("token_transfer.contract_address", "=", voucherAddress)
      .select(["recipient_address as address"])
      .execute();
  }
}
