/**
 * Nonce diagnostic script for the writer account.
 *
 * Checks the current nonce state across all configured RPCs
 * to detect gaps or inconsistencies.
 *
 * Usage:
 *   WRITER_PRIVATE_KEY=0x... npx tsx scripts/check-nonce.ts
 */

import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";

const WRITER_PRIVATE_KEY = process.env.WRITER_PRIVATE_KEY;
if (!WRITER_PRIVATE_KEY) {
  console.error("WRITER_PRIVATE_KEY environment variable is required");
  process.exit(1);
}

const account = privateKeyToAccount(WRITER_PRIVATE_KEY as `0x${string}`);
console.log(`Writer address: ${account.address}\n`);

const rpcs = [
  { name: "r3-celo", url: "https://r3-celo.grassecon.org" },
  { name: "r4-celo", url: "https://r4-celo.grassecon.org" },
  { name: "public", url: "https://forno.celo.org" },
];

async function main() {
  const results = await Promise.allSettled(
    rpcs.map(async (rpc) => {
      const client = createPublicClient({
        chain: celo,
        transport: http(rpc.url),
      });
      const [pending, confirmed] = await Promise.all([
        client.getTransactionCount({
          address: account.address,
          blockTag: "pending",
        }),
        client.getTransactionCount({
          address: account.address,
          blockTag: "latest",
        }),
      ]);
      return { ...rpc, pending, confirmed, gap: pending - confirmed };
    })
  );

  console.log("RPC Nonce Report:");
  console.log("-".repeat(65));
  for (const result of results) {
    if (result.status === "fulfilled") {
      const r = result.value;
      const gapWarning = r.gap > 0 ? ` ** ${r.gap} pending` : "";
      console.log(
        `  ${r.name.padEnd(12)} | confirmed: ${r.confirmed} | pending: ${r.pending}${gapWarning}`
      );
    } else {
      console.log(`  ${"???".padEnd(12)} | ERROR: ${result.reason}`);
    }
  }

  const fulfilled: Array<{
    name: string;
    url: string;
    pending: number;
    confirmed: number;
    gap: number;
  }> = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      fulfilled.push(result.value);
    }
  }

  if (fulfilled.length > 1) {
    const confirmedNonces = fulfilled.map((r) => r.confirmed);
    const min = Math.min(...confirmedNonces);
    const max = Math.max(...confirmedNonces);
    if (max - min > 0) {
      console.log(
        `\n** CROSS-RPC INCONSISTENCY: confirmed nonces differ by ${max - min}`
      );
      console.log(
        "  This indicates RPCs are not in sync and may cause nonce issues."
      );
    } else {
      console.log("\nAll RPCs report consistent confirmed nonce.");
    }
  }
}

main().catch(console.error);
