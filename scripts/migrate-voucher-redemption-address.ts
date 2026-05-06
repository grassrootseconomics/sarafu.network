/**
 * Migration script: Populate redemption_address for existing vouchers
 *
 * Prerequisites:
 *   1. Apply migrations/add-voucher-redemption-address.sql:
 *      ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS redemption_address VARCHAR(66);
 *   2. Set DATABASE_URL env var pointing to the graph database.
 *
 * Usage:
 *   DATABASE_URL=postgres://... npx tsx scripts/migrate-voucher-redemption-address.ts
 *
 * What it does:
 *   - Reads all vouchers from the graph DB where redemption_address IS NULL.
 *   - For each voucher, calls owner() on the deployed contract on Celo.
 *   - Writes the resulting address into redemption_address.
 *   - On read failure (non-demurrage tokens, removed contracts, RPC issues) the
 *     row is left NULL — it can be set later via the voucher edit UI. The
 *     Redeem flow gates on this column being non-null.
 */

import { createPublicClient, http, isAddress } from "viem";
import { celo } from "viem/chains";
import pg from "pg";

const CELO_RPC = "https://r4-celo.grassecon.org";

const ownerAbi = [
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

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
      voucher_address: string;
    }>(
      "SELECT id, voucher_address FROM vouchers WHERE redemption_address IS NULL"
    );

    console.log(`Found ${rows.length} vouchers to migrate`);

    let migrated = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        const owner = await client.readContract({
          address: row.voucher_address as `0x${string}`,
          abi: ownerAbi,
          functionName: "owner",
        });

        if (!isAddress(owner)) {
          throw new Error(`Returned non-address: ${String(owner)}`);
        }

        await pool.query(
          "UPDATE vouchers SET redemption_address = $1 WHERE id = $2",
          [owner, row.id]
        );

        console.log(
          `  Voucher ${row.id}: ${row.voucher_address} -> ${owner}`
        );
        migrated++;
      } catch (error) {
        console.error(
          `  Voucher ${row.id}: Failed to read owner for ${row.voucher_address}:`,
          (error as Error).message
        );
        failed++;
      }
    }

    console.log(
      `\nMigration complete: ${migrated} succeeded, ${failed} skipped (left NULL)`
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
