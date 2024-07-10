import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { env } from "~/env";
import { PointPlugin } from "../plugins";
import { type DB as GraphDB } from "./db";
import { type DB as IndexerDB } from "./indexer-db";

const globalForDatabases = globalThis as unknown as {
  graphDB: Kysely<GraphDB> | undefined;
  indexerDB: Kysely<IndexerDB> | undefined;
};

export const graphDB =
  globalForDatabases.graphDB ??
  new Kysely<GraphDB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: env.DATABASE_URL,
      }),
    }),
    plugins: [new PointPlugin()],
  });
export const indexerDB =
  globalForDatabases.indexerDB ??
  new Kysely<IndexerDB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: env.INDEXER_DB_URL,
      }),
    }),
  });
if (env.NODE_ENV !== "production") globalForDatabases.graphDB = graphDB;
if (env.NODE_ENV !== "production") globalForDatabases.indexerDB = indexerDB;
