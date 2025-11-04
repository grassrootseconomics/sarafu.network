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
        max: 10, // Increased from 6 for FDW connections
        idleTimeoutMillis: 90000, // Increased from 60s to 90s for FDW queries
        connectionTimeoutMillis: 60000, // Increased from 20s to 60s
      }),
    }),
    // log: env.NODE_ENV !== "production" ? ["query"] : undefined,
  });
globalForDatabases.graphDB = graphDB;
globalForDatabases.federatedDB = federatedDB;
