import { TRPCError } from "@trpc/server";
import { sql, type Kysely } from "kysely";
import { getAddress } from "viem";
import { type FederatedDB, type GraphDB } from "../db";
import { TagModel } from "./tag";

export class PoolModel {
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

  async create(
    poolAddress: `0x${string}`,
    input: {
      description: string;
      unit_of_account: string;
      banner_url?: string;
      tags?: string[];
      pool_name?: string;
    }
  ): Promise<void> {
    const tagModel = new TagModel({ graphDB: this.graphDB });
    const db_pool = await this.graphDB
      .insertInto("swap_pools")
      .values({
        pool_address: poolAddress,
        pool_name: input.pool_name ?? null,
        swap_pool_description: input.description,
        banner_url: input.banner_url,
        default_voucher: poolAddress,
        unit_of_account: input.unit_of_account,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    // Do not fail if tags are not added
    try {
      if (input.tags && input.tags.length > 0) {
        await tagModel.updatePoolTags(db_pool.id, input.tags);
      }
    } catch (error) {
      console.error("Error adding tags to pool:", error);
    }
  }

  async get(poolAddress: `0x${string}`) {
    const pool_address = getAddress(poolAddress);
    try {
      const pool = await this.graphDB
        .selectFrom("swap_pools")
        .where("pool_address", "=", pool_address)
        .select([
          "id",
          "pool_address",
          "pool_name",
          "default_voucher",
          "unit_of_account",
          "swap_pool_description",
          "banner_url",
        ])
        .executeTakeFirstOrThrow();

      const tagModel = new TagModel({ graphDB: this.graphDB });
      const tags = await tagModel.getPoolTags(pool.id);

      return {
        ...pool,
        pool_address,
        default_voucher: pool.default_voucher as `0x${string}`,
        tags,
      };
    } catch (error) {
      if ((error as Error).message.includes("no result")) {
        return null;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Pool not found",
      });
    }
  }

  async update(
    poolAddress: `0x${string}`,
    input: {
      pool_name?: string | null;
      banner_url?: string | null;
      swap_pool_description?: string;
      unit_of_account?: string;
      tags?: string[];
    }
  ) {
    let db_pool = await this.graphDB
      .updateTable("swap_pools")
      .set({
        pool_name: input.pool_name ?? null,
        banner_url: input.banner_url,
        swap_pool_description: input.swap_pool_description,
        ...(input.unit_of_account && {
          unit_of_account: input.unit_of_account,
        }),
      })
      .where("pool_address", "=", poolAddress)
      .returning("id")
      .executeTakeFirst();
    if (!db_pool) {
      db_pool = await this.graphDB
        .insertInto("swap_pools")
        .values({
          pool_address: poolAddress,
          pool_name: input.pool_name ?? null,
          banner_url: input.banner_url,
          swap_pool_description: input.swap_pool_description ?? "",
          default_voucher: poolAddress,
          unit_of_account: input.unit_of_account ?? "USD",
        })
        .returning("id")
        .executeTakeFirstOrThrow();
    }
    const tagModel = new TagModel({ graphDB: this.graphDB });
    if (input.tags && db_pool) {
      await tagModel.updatePoolTags(db_pool.id, input.tags);
    }
    return { message: "Pool updated successfully" };
  }

  async remove(poolAddress: `0x${string}`) {
    await this.graphDB.transaction().execute(async (trx) => {
      const pool = await trx
        .selectFrom("swap_pools")
        .where("pool_address", "=", poolAddress)
        .select("id")
        .executeTakeFirst();
      if (pool) {
        await trx
          .deleteFrom("swap_pool_tags")
          .where("swap_pool", "=", pool.id)
          .execute();
        await trx
          .deleteFrom("swap_pools")
          .where("id", "=", pool.id)
          .execute();
      }
    });
  }

  async list(options: {
    sortBy: "swaps" | "name" | "vouchers";
    sortDirection: "asc" | "desc";
  }) {
    // Step 1: Chain data from federatedDB (parallel)
    const [chainPools, swapStats, voucherStats] = await Promise.all([
      this.federatedDB
        .selectFrom("chain_data_v2.pools")
        .where("removed", "=", false)
        .select(["contract_address", "pool_name", "pool_symbol"])
        .execute(),
      this.federatedDB
        .selectFrom("chain_data_v2.pool_swap")
        .select([
          "contract_address",
          sql<number>`COUNT(*)`.as("swap_count"),
        ])
        .groupBy("contract_address")
        .execute(),
      this.federatedDB
        .selectFrom("pool_router.pool_allowed_tokens")
        .select([
          "pool_address",
          sql<number>`COUNT(DISTINCT token_address)`.as("voucher_count"),
        ])
        .groupBy("pool_address")
        .execute(),
    ]);

    // Step 2: App metadata + tags from graphDB
    const graphPools = await this.graphDB
      .selectFrom("swap_pools")
      .select([
        "id",
        "pool_address",
        "pool_name",
        "swap_pool_description",
        "banner_url",
      ])
      .execute();

    const graphPoolIds = graphPools.map((p) => p.id);
    const tagMap =
      graphPoolIds.length > 0
        ? await this.getPoolTagsBatch(graphPoolIds)
        : new Map<number, string[]>();

    // Step 3: Materialize into Maps
    const swapMap = new Map(
      swapStats.map((s) => [s.contract_address, s.swap_count])
    );
    const voucherMap = new Map(
      voucherStats.map((s) => [s.pool_address, s.voucher_count])
    );
    const graphMap = new Map(
      graphPools.map((p) => [p.pool_address, p])
    );

    // Step 4: Merge (prefer graphDB pool_name over chain pool_name)
    const pools = chainPools.map((cp) => {
      const gp = graphMap.get(cp.contract_address);
      return {
        contract_address: cp.contract_address,
        pool_name: gp?.pool_name ?? cp.pool_name,
        pool_symbol: cp.pool_symbol,
        description: gp?.swap_pool_description ?? "",
        banner_url: gp?.banner_url ?? null,
        tags:
          (gp?.id != null ? tagMap.get(gp.id) : undefined)?.filter(
            Boolean
          ) ?? [],
        swap_count: swapMap.get(cp.contract_address) ?? 0,
        voucher_count: voucherMap.get(cp.contract_address) ?? 0,
      };
    });

    // Step 5: Sort in JS
    const dir = options.sortDirection === "asc" ? 1 : -1;
    pools.sort((a, b) => {
      if (options.sortBy === "swaps") {
        return (a.swap_count - b.swap_count) * dir;
      }
      if (options.sortBy === "vouchers") {
        return (a.voucher_count - b.voucher_count) * dir;
      }
      // name
      return (
        (a.pool_name ?? "").localeCompare(b.pool_name ?? "") * dir
      );
    });

    return pools;
  }

  async featuredPools(limit: number) {
    // Step 1: Chain data from federatedDB (parallel)
    const [chainPools, swapStats] = await Promise.all([
      this.federatedDB
        .selectFrom("chain_data_v2.pools")
        .where("removed", "=", false)
        .select(["contract_address", "pool_name", "pool_symbol"])
        .execute(),
      this.federatedDB
        .selectFrom("chain_data_v2.pool_swap")
        .select([
          "contract_address",
          sql<number>`COUNT(*)`.as("swap_count"),
        ])
        .groupBy("contract_address")
        .execute(),
    ]);

    // Step 2: GraphDB pools with banner_url (only featured-eligible)
    const graphPools = await this.graphDB
      .selectFrom("swap_pools")
      .where("banner_url", "is not", null)
      .where("banner_url", "!=", "")
      .select([
        "id",
        "pool_address",
        "pool_name",
        "swap_pool_description",
        "banner_url",
      ])
      .execute();

    const graphMap = new Map(
      graphPools.map((p) => [p.pool_address, p])
    );
    const graphPoolIds = graphPools.map((p) => p.id);
    const tagMap =
      graphPoolIds.length > 0
        ? await this.getPoolTagsBatch(graphPoolIds)
        : new Map<number, string[]>();
    const swapMap = new Map(
      swapStats.map((s) => [s.contract_address, s.swap_count])
    );

    // Step 3: Merge -- only pools that have a banner qualify
    return chainPools
      .filter((cp) => graphMap.has(cp.contract_address))
      .map((cp) => {
        const gp = graphMap.get(cp.contract_address)!;
        return {
          address: cp.contract_address,
          title: gp.pool_name ?? cp.pool_name ?? "Unnamed Pool",
          location: cp.pool_symbol ?? "Unknown Location",
          cause:
            gp.swap_pool_description ??
            "Supporting community initiatives",
          image: gp.banner_url!,
          tags: (tagMap.get(gp.id) ?? []).filter(Boolean),
          swap_count: swapMap.get(cp.contract_address) ?? 0,
        };
      })
      .sort((a, b) => b.swap_count - a.swap_count)
      .slice(0, limit);
  }

  async getPoolsByAddresses(addresses: Set<`0x${string}`>) {
    if (addresses.size === 0) return [];
    const addressArray = Array.from(addresses);

    // Step 1: Chain pool info from federatedDB
    // Step 2: GraphDB metadata (parallel)
    const [chainPools, graphPools] = await Promise.all([
      this.federatedDB
        .selectFrom("chain_data_v2.pools")
        .where("contract_address", "in", addressArray)
        .where("removed", "=", false)
        .select(["contract_address", "pool_name", "pool_symbol"])
        .execute(),
      this.graphDB
        .selectFrom("swap_pools")
        .where("pool_address", "in", addressArray)
        .select([
          "pool_address",
          "pool_name",
          "swap_pool_description",
          "banner_url",
        ])
        .execute(),
    ]);

    const graphMap = new Map(
      graphPools.map((p) => [p.pool_address, p])
    );

    // Step 3: Merge
    return chainPools.map((cp) => {
      const gp = graphMap.get(cp.contract_address);
      return {
        contract_address: cp.contract_address,
        pool_name: cp.pool_name,
        pool_symbol: cp.pool_symbol,
        description: gp?.swap_pool_description ?? "",
        banner_url: gp?.banner_url ?? null,
      };
    });
  }

  private async getPoolTagsBatch(
    poolIds: number[]
  ): Promise<Map<number, string[]>> {
    if (poolIds.length === 0) return new Map();
    const rows = await this.graphDB
      .selectFrom("swap_pool_tags")
      .innerJoin("tags", "swap_pool_tags.tag", "tags.id")
      .where("swap_pool_tags.swap_pool", "in", poolIds)
      .select(["swap_pool_tags.swap_pool", "tags.tag"])
      .execute();
    const map = new Map<number, string[]>();
    for (const row of rows) {
      const arr = map.get(row.swap_pool) ?? [];
      arr.push(row.tag);
      map.set(row.swap_pool, arr);
    }
    return map;
  }
}
