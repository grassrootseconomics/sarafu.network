/**
 * Unstick a stuck nonce by sending a zero-value self-transfer
 * with higher gas to replace the stuck transaction.
 *
 * Usage:
 *   WRITER_PRIVATE_KEY=0x... npx tsx scripts/unstick-nonce.ts
 *   WRITER_PRIVATE_KEY=0x... npx tsx scripts/unstick-nonce.ts 16958  # specific nonce
 */

import { createPublicClient, createWalletClient, http, parseGwei } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";

const WRITER_PRIVATE_KEY = process.env.WRITER_PRIVATE_KEY;
if (!WRITER_PRIVATE_KEY) {
  console.error("WRITER_PRIVATE_KEY environment variable is required");
  process.exit(1);
}

const account = privateKeyToAccount(WRITER_PRIVATE_KEY as `0x${string}`);

const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://r3-celo.grassecon.org"),
});

const walletClient = createWalletClient({
  account,
  chain: celo,
  transport: http("https://r3-celo.grassecon.org"),
});

async function main() {
  const [pending, confirmed] = await Promise.all([
    publicClient.getTransactionCount({
      address: account.address,
      blockTag: "pending",
    }),
    publicClient.getTransactionCount({
      address: account.address,
      blockTag: "latest",
    }),
  ]);

  console.log(`Writer address: ${account.address}`);
  console.log(`Confirmed nonce: ${confirmed} | Pending nonce: ${pending}`);

  if (pending === confirmed) {
    console.log("\nNo stuck transactions. Nothing to do.");
    return;
  }

  // Use CLI arg or default to the first stuck nonce
  const targetNonce = process.argv[2]
    ? parseInt(process.argv[2])
    : confirmed;

  console.log(`\nUnsticking nonce ${targetNonce}...`);
  console.log(
    `Sending 0-value self-transfer to ${account.address} with high gas`
  );

  const hash = await walletClient.sendTransaction({
    to: account.address,
    value: 0n,
    nonce: targetNonce,
    maxFeePerGas: parseGwei("50"),
    maxPriorityFeePerGas: parseGwei("10"),
  });

  console.log(`Replacement tx sent: ${hash}`);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    confirmations: 2,
    timeout: 60_000,
  });

  console.log(`Confirmed in block ${receipt.blockNumber} | Status: ${receipt.status}`);

  // Check nonce state after
  const newConfirmed = await publicClient.getTransactionCount({
    address: account.address,
    blockTag: "latest",
  });
  console.log(`New confirmed nonce: ${newConfirmed}`);
}

main().catch(console.error);
