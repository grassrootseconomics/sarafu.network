import { Kysely, PostgresDialect } from "kysely";
import { type DB } from "kysely-codegen";
import { Pool } from "pg";
import { env } from "~/env.mjs";
import { PointPlugin } from "./plugins";

const globalForKysely = globalThis as unknown as {
  kysely: Kysely<DB> | undefined;
};

export const kysely =
  globalForKysely.kysely ??
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: env.DATABASE_URL,
      }),
    }),
    plugins: [new PointPlugin()],
  });

if (env.NODE_ENV !== "production") globalForKysely.kysely = kysely;
