import { sql, type Kysely } from "kysely";
import { type FederatedDB, type GraphDB } from "~/server/db";
import { type CommodityType } from "~/server/enums";
import { type UpdateVoucherInput } from "../routers/voucher";

export class VoucherModel {
  private graphDB: Kysely<GraphDB>;
  private federatedDB: Kysely<FederatedDB>;
  constructor({
    graphDB,
    federatedDB,
  }: {
    graphDB: Kysely<GraphDB>;
    federatedDB: Kysely<FederatedDB>;
  }) {
    this.graphDB = graphDB;
    this.federatedDB = federatedDB;
  }

  async listVouchers(options?: {
    sortBy: "transactions" | "name" | "created";
    sortDirection: "asc" | "desc";
  }) {
    let query = this.graphDB
      .selectFrom("vouchers")
      .select([
        "vouchers.id",
        "vouchers.voucher_address",
        "vouchers.voucher_name",
        "vouchers.voucher_description",
        "vouchers.geo",
        "vouchers.location_name",
        "vouchers.voucher_email",
        "vouchers.voucher_website",
        "vouchers.voucher_type",
        "vouchers.voucher_uoa",
        "vouchers.banner_url",
        "vouchers.icon_url",
        "vouchers.created_at",
        "vouchers.voucher_value",
        "vouchers.sink_address",
        "vouchers.symbol",
        sql<number>`0`.as("transaction_count"), // Default to 0 for now
      ]);

    // Apply sorting
    if (options?.sortBy === "transactions") {
      // For now, fallback to created_at sorting when transactions sorting is requested
      query = query.orderBy("vouchers.created_at", options.sortDirection === "asc" ? "desc" : "asc");
    } else if (options?.sortBy === "name") {
      query = query.orderBy("vouchers.voucher_name", options.sortDirection);
    } else if (options?.sortBy === "created") {
      query = query.orderBy("vouchers.created_at", options.sortDirection);
    } else {
      // Default sort by created_at desc (most recent first)
      query = query.orderBy("vouchers.created_at", "desc");
    }

    const baseResult = await query.execute();

    // Try to get transaction counts from federated DB if available
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const transactionCounts = await this.federatedDB
        .selectFrom("chain_data.token_transfer")
        .leftJoin("chain_data.tx", "chain_data.tx.id", "chain_data.token_transfer.tx_id")
        .select([
          "contract_address",
          sql<number>`COUNT(*)`.as("transaction_count"),
        ])
        .where("chain_data.tx.date_block", ">=", thirtyDaysAgo)
        .where("chain_data.tx.success", "=", true)
        .groupBy("contract_address")
        .execute();

      // Create a map of contract addresses to transaction counts
      const transactionMap = new Map(
        transactionCounts.map(t => [t.contract_address, t.transaction_count])
      );

      // Merge transaction counts into the base result
      const resultWithCounts = baseResult.map(voucher => ({
        ...voucher,
        transaction_count: transactionMap.get(voucher.voucher_address) || 0,
      }));

      // Re-sort by transaction count if that was requested
      if (options?.sortBy === "transactions") {
        return resultWithCounts.sort((a, b) => {
          const direction = options.sortDirection === "asc" ? 1 : -1;
          return (a.transaction_count - b.transaction_count) * direction;
        });
      }

      return resultWithCounts;
    } catch (error) {
      console.warn("Could not fetch transaction counts from federated DB:", error);
      // Return base result with transaction_count = 0 for all vouchers
      return baseResult;
    }
  }
  async countVouchers() {
    return this.graphDB
      .selectFrom("vouchers")
      .select(sql<number>`count(*)`.as("count"))
      .executeTakeFirstOrThrow();
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
        "image_url",
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
    image_url: string;
  }) {
    return this.graphDB
      .insertInto("product_listings")
      .values(commodityData)
      .executeTakeFirstOrThrow();
  }
  async addVoucherCommodityBulk(
    commodityData: {
      commodity_name: string;
      commodity_description: string;
      commodity_type: keyof typeof CommodityType;
      voucher: number;
      quantity: number;
      location_name: string;
      frequency: string;
      account: number;
    }[]
  ) {
    return this.graphDB
      .insertInto("product_listings")
      .values(commodityData)
      .execute();
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
        .deleteFrom("voucher_issuers")
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
    return this.federatedDB
      .selectFrom("chain_data.token_transfer")
      .leftJoin(
        "chain_data.tx",
        "chain_data.tx.id",
        "chain_data.token_transfer.tx_id"
      )
      .distinctOn("recipient_address")
      .where("chain_data.token_transfer.contract_address", "=", voucherAddress)
      .select(["recipient_address as address"])
      .execute();
  }
}
