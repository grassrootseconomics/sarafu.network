/**
 * Migration script: Normalize unit_of_account values
 *
 * Converts wrapped/stablecoin symbols to their base currency:
 *   - USDm, USD₮ → USD
 *   - KESm → KES
 *
 * Prerequisites:
 *   Set DATABASE_URL env var pointing to the graph database
 *
 * Usage:
 *   npx tsx scripts/normalize-pool-uoa.ts
 */

import pg from "pg";

const NORMALIZATIONS: Record<string, string> = {
  USDm: "USD",
  "USD₮": "USD",
  KESm: "KES",
};

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: databaseUrl });

  try {
    for (const [from, to] of Object.entries(NORMALIZATIONS)) {
      const result = await pool.query(
        "UPDATE swap_pools SET unit_of_account = $1 WHERE unit_of_account = $2",
        [to, from]
      );
      console.log(`  ${from} → ${to}: ${result.rowCount} row(s) updated`);
    }

    console.log("\nNormalization complete.");
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
