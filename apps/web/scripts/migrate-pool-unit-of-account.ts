/**
 * Migration script: Populate unit_of_account for existing pools
 *
 * Prerequisites:
 *   1. Add the column: ALTER TABLE swap_pools ADD COLUMN unit_of_account VARCHAR(50);
 *   2. Set DATABASE_URL env var pointing to the graph database
 *
 * Usage:
 *   npx tsx scripts/migrate-pool-unit-of-account.ts
 *
 * What it does:
 *   - Reads all pools from swap_pools
 *   - For each pool, reads the ERC20 symbol() of the default_voucher address on Celo
 *   - Writes the symbol as unit_of_account
 *   - After migration, make column non-nullable:
 *     ALTER TABLE swap_pools ALTER COLUMN unit_of_account SET NOT NULL;
 *     ALTER TABLE swap_pools ALTER COLUMN unit_of_account SET DEFAULT 'USD';
 */

import { createPublicClient, erc20Abi, http } from "viem";
import { celo } from "viem/chains";
import pg from "pg";

const CELO_RPC = "https://r4-celo.grassecon.org";

const client = createPublicClient({
  chain: celo,
  transport: http(CELO_RPC),
});

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: databaseUrl });

  try {
    const { rows } = await pool.query<{
      id: number;
      default_voucher: string;
    }>("SELECT id, default_voucher FROM swap_pools WHERE unit_of_account IS NULL");

    console.log(`Found ${rows.length} pools to migrate`);

    let migrated = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        const symbol = await client.readContract({
          address: row.default_voucher as `0x${string}`,
          abi: erc20Abi,
          functionName: "symbol",
        });

        await pool.query(
          "UPDATE swap_pools SET unit_of_account = $1 WHERE id = $2",
          [symbol, row.id]
        );

        console.log(`  Pool ${row.id}: ${row.default_voucher} -> ${symbol}`);
        migrated++;
      } catch (error) {
        console.error(
          `  Pool ${row.id}: Failed to read symbol for ${row.default_voucher}:`,
          (error as Error).message
        );
        // Fallback to "USD" for pools where the contract can't be read
        await pool.query(
          "UPDATE swap_pools SET unit_of_account = $1 WHERE id = $2",
          ["USD", row.id]
        );
        console.log(`  Pool ${row.id}: Fallback to USD`);
        failed++;
      }
    }

    console.log(
      `\nMigration complete: ${migrated} succeeded, ${failed} fell back to USD`
    );
    console.log(
      "\nNext steps:\n" +
        "  ALTER TABLE swap_pools ALTER COLUMN unit_of_account SET NOT NULL;\n" +
        "  ALTER TABLE swap_pools ALTER COLUMN unit_of_account SET DEFAULT 'USD';"
    );
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
