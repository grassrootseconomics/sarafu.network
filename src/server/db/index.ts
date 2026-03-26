/**
 * Dual Database Setup
 *
 * DATA OWNERSHIP MAP
 *
 * Chain-owned (read-only, from blockchain indexer via federatedDB):
 *   chain_data_v2.tokens       - contract_address, token_name, token_symbol, token_decimals, sink_address, removed
 *   chain_data_v2.pools        - contract_address, pool_name, pool_symbol, removed
 *   chain_data_v2.tx           - tx_hash, block_number, date_block, success
 *   chain_data_v2.*_transfer   - all transfer events
 *   chain_data_v2.*_mint/burn  - all mint/burn events
 *   chain_data_v2.pool_swap    - all swap events
 *   chain_data_v2.pool_deposit - all deposit events
 *   pool_router.swap_pools     - owner_address, fees, registry addresses
 *   pool_router.tokens         - token_owner, token_address
 *   pool_router.pool_allowed_tokens - pool-token associations
 *
 * App-owned (writable, in graphDB):
 *   vouchers          - voucher_name*, symbol*, sink_address*, description, email, website, type, value, uoa, icon, banner, geo, location, active
 *   swap_pools        - pool_name*, description, banner_url, default_voucher, unit_of_account, terms
 *   users/accounts    - all user profile data, roles, gas status, onboarding
 *   personal_info     - names, gender, year_of_birth, location, geo, email, bio, photo
 *   product_listings  - all commodity data
 *   field_reports     - all report data
 *   tags              - all tag data
 *   swap_pool_tags    - pool-tag associations
 *   voucher_issuers   - voucher-backer associations
 *
 *   * = seeded from chain at creation time, then independently maintained
 *
 * QUERY PATTERN: Use materialize-and-merge for cross-database queries.
 * Fetch from federatedDB and graphDB separately (ideally via Promise.all),
 * then merge results in application code using a shared key (e.g. contract_address).
 * Do NOT use sarafu_network.* FDW mirror tables -- always query graphDB directly.
 */
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { env } from "~/env";
import { PointPlugin } from "../plugins";
import { type DB as FederatedDB } from "./federated-db";
import { type DB as GraphDB } from "./graph-db";

const globalForDatabases = globalThis as unknown as {
  graphDB: Kysely<GraphDB> | undefined;
  federatedDB: Kysely<FederatedDB> | undefined;
};
export type { FederatedDB, GraphDB };
export const graphDB =
  globalForDatabases.graphDB ??
  new Kysely<GraphDB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: env.GRAPH_DB_URL,
        max: 10, // Increased from 6 for better concurrency
        idleTimeoutMillis: 30000, // Increased from 10s to 30s
        connectionTimeoutMillis: 60000, // Increased from 20s to 60s
      }),
    }),
    // log: env.NODE_ENV !== "production" ? ["query"] : undefined,
    plugins: [new PointPlugin()],
  });

export const federatedDB =
  globalForDatabases.federatedDB ??
  new Kysely<FederatedDB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: env.FEDERATED_DB_URL,
        max: 15, // Increased for better FDW concurrency
        idleTimeoutMillis: 120000, // 2 minutes - longer for FDW to avoid reconnect overhead
        connectionTimeoutMillis: 90000, // 90s - longer timeout for FDW connections
        allowExitOnIdle: false, // Keep pool alive
        // TCP keepalive for better FDW connection stability
        ...(env.NODE_ENV !== "test" && {
          keepAlive: true,
          keepAliveInitialDelayMillis: 10000,
        }),
      }),
    }),
    // log: env.NODE_ENV !== "production" ? ["query"] : undefined,
  });
globalForDatabases.graphDB = graphDB;
globalForDatabases.federatedDB = federatedDB;
