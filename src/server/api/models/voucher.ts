import { sql, type Kysely } from "kysely";
import { publicClient } from "~/config/viem.config.server";
import { type FederatedDB, type GraphDB } from "~/server/db";
import { type CommodityType } from "~/server/enums";
import { cacheWithExpiry } from "~/utils/cache/cache";
import { Context } from "../context";
import { type UpdateVoucherInput } from "../routers/voucher";
import { getTokenDetails } from "./token";

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
  async getPools(voucherAddress: string) {
    return (
      this.federatedDB
        .selectFrom("pool_router.pool_allowed_tokens")
        .where("token_address", "=", voucherAddress)
        // distinct on pool_address
        .distinctOn("pool_address")
        .select(["pool_address"])
        .execute()
    );
  }
  async listVouchers(options?: {
    sortBy: "transactions" | "name" | "created";
    sortDirection: "asc" | "desc";
  }) {
    const sortBy = options?.sortBy ?? "created";
    const sortDirection = options?.sortDirection ?? "desc";

    // Try to get transaction counts from federated DB if available
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Step 1: Materialize transaction counts from federated DB FIRST
      // This avoids cross-database subquery issues with FDW tables
      // Cache for 1 day (86400 seconds) since transaction counts don't change frequently
      const cacheKey = `voucher-transaction-counts:30d`;
      const transactionCountsData = await cacheWithExpiry(
        cacheKey,
        86400, // 1 day TTL
        async () => {
          return await this.federatedDB
            .selectFrom("chain_data.token_transfer")
            .innerJoin(
              "chain_data.tx",
              "chain_data.tx.id",
              "chain_data.token_transfer.tx_id"
            )
            .select([
              "contract_address",
              sql<number>`COUNT(*)`.as("transaction_count"),
            ])
            .where("chain_data.tx.date_block", ">=", thirtyDaysAgo)
            .where("chain_data.tx.success", "=", true)
            .groupBy("contract_address")
            .execute();
        }
      );

      // Step 2: Convert to a Map for efficient lookup
      const txCountMap = new Map(
        transactionCountsData.map((row) => [
          row.contract_address,
          Number(row.transaction_count),
        ])
      );

      // Step 3: Get all vouchers from graph DB
      let vouchersQuery = this.graphDB
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
        ]);

      // Apply sorting if not by transactions (we'll sort in-memory for transaction counts)
      if (sortBy === "name") {
        vouchersQuery = vouchersQuery.orderBy(
          "vouchers.voucher_name",
          sortDirection
        );
      } else if (sortBy === "created") {
        vouchersQuery = vouchersQuery.orderBy(
          "vouchers.created_at",
          sortDirection
        );
      }

      const vouchers = await vouchersQuery.execute();

      // Step 4: Merge transaction counts with vouchers
      const vouchersWithCounts = vouchers.map((voucher) => ({
        ...voucher,
        transaction_count: txCountMap.get(voucher.voucher_address) ?? 0,
      }));

      // Step 5: Sort by transaction count if requested
      if (sortBy === "transactions") {
        vouchersWithCounts.sort((a, b) => {
          const diff = a.transaction_count - b.transaction_count;
          return sortDirection === "asc" ? diff : -diff;
        });
      }

      return vouchersWithCounts;
    } catch (error) {
      console.error(
        "Could not fetch transaction counts from federated DB:",
        error instanceof Error ? error.message : String(error)
      );
      console.error("Full error:", error);

      // Fallback: Return base vouchers without transaction counts
      let fallbackQuery = this.graphDB
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
        ]);

      // Apply sorting for fallback
      if (sortBy === "name") {
        fallbackQuery = fallbackQuery.orderBy(
          "vouchers.voucher_name",
          sortDirection
        );
      } else {
        fallbackQuery = fallbackQuery.orderBy(
          "vouchers.created_at",
          sortDirection
        );
      }

      const vouchers = await fallbackQuery.execute();
      return vouchers.map((voucher) => ({
        ...voucher,
        transaction_count: 0,
      }));
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

  async getVoucherInfo(voucherAddress: string) {
    const voucherId = await this.getVoucherIdByAddress(voucherAddress);
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
  async getVoucherIdByAddress(voucherAddress: string) {
    const voucher = await this.graphDB
      .selectFrom("vouchers")
      .where("voucher_address", "=", voucherAddress)
      .select("id")
      .executeTakeFirstOrThrow();
    return voucher.id;
  }
  async getVoucherIssuers(voucherAddress: string) {
    const voucherId = await this.getVoucherIdByAddress(voucherAddress);

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

  async addVoucherIssuer(voucherAddress: string, backerId: number) {
    const voucherId = await this.getVoucherIdByAddress(voucherAddress);

    return this.graphDB
      .insertInto("voucher_issuers")
      .values({
        voucher: voucherId,
        backer: backerId,
      })
      .executeTakeFirstOrThrow();
  }

  async getVoucherCommodities(voucherAddress: string) {
    const commodities = await this.graphDB
      .selectFrom("product_listings")
      .select([
        "product_listings.id",
        "price",
        "commodity_name",
        "commodity_description",
        sql<keyof typeof CommodityType>`commodity_type`.as("commodity_type"),
        "quantity",
        "image_url",
        "frequency",
      ])
      .leftJoin("vouchers", "product_listings.voucher", "vouchers.id")
      .select(["vouchers.voucher_address"])
      .where("vouchers.voucher_address", "=", voucherAddress)
      .execute();
    return commodities.map((commodity) => ({
      ...commodity,
      voucher_address: commodity.voucher_address as `0x${string}`,
    }));
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
        voucher_uoa: input.voucherUoa,
        voucher_value: input.voucherValue,
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

interface VoucherDetails {
  voucher_address: string;
  symbol: string;
  voucher_name: string;
  icon_url: string | null;
  voucher_type: string;
}

export async function loadVouchers(
  ctx: Context,
  addresses: Set<`0x${string}`>
) {
  // Get existing voucher details from DB
  const existingVouchers = await ctx.graphDB
    .selectFrom("vouchers")
    .select([
      "voucher_address",
      "symbol",
      "voucher_name",
      "vouchers.icon_url",
      "voucher_type",
    ])
    .where("voucher_address", "in", Array.from(addresses))
    .execute();

  // Create lookup map for existing vouchers
  const voucherMap = new Map(
    existingVouchers.map((v) => [v.voucher_address, v])
  );

  // Fetch missing voucher details in parallel
  const voucherPromises = Array.from(addresses).map(
    async (voucherAddress): Promise<VoucherDetails> => {
      const existing = voucherMap.get(voucherAddress);
      if (existing) return existing;

      try {
        const details = await getTokenDetails(publicClient, {
          address: voucherAddress,
        });
        return {
          voucher_address: voucherAddress,
          symbol: details.symbol ?? "Unknown",
          icon_url: null,
          voucher_name: details.name ?? "Unknown",
          // cSpell:ignore GIFTABLE
          voucher_type: "GIFTABLE",
        };
      } catch (error) {
        console.error(
          `Failed to fetch details for voucher ${voucherAddress}:`,
          error
        );
        return {
          voucher_address: voucherAddress,
          symbol: "Error",
          icon_url: null,
          voucher_name: "Failed to load",
          // cSpell:ignore GIFTABLE
          voucher_type: "GIFTABLE",
        };
      }
    }
  );

  return Promise.all(voucherPromises);
}
