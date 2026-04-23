import { createWalletClient } from "viem";
import { nonceManager, privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { Redis } from "@upstash/redis";
import { celoTransport } from "./chain";
import { env } from "./env";

const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

// Factory function — TypeScript infers the specific WalletClient<celoTransport, celo, PrivateKeyAccount>
// type from the actual createWalletClient(...) call, preserving account/chain narrowing.
function createWriterInstances() {
  const { WRITER_PRIVATE_KEY } = env;
  const account = privateKeyToAccount(
    WRITER_PRIVATE_KEY as `0x${string}`,
    { nonceManager }
  );
  const client = createWalletClient({
    account,
    chain: celo,
    transport: celoTransport,
  });
  return { account, client };
}

// Singleton pattern (same as src/server/db/index.ts) to share nonce manager
// state across sequential transactions within a single serverless invocation.
type WriterInstances = ReturnType<typeof createWriterInstances>;

const globalForWriter = globalThis as unknown as {
  writerInstances: WriterInstances | undefined;
};

function getWriterInstances() {
  if (!globalForWriter.writerInstances) {
    globalForWriter.writerInstances = createWriterInstances();
  }
  return globalForWriter.writerInstances;
}

export function getWriterAccount() {
  return getWriterInstances().account;
}

export function getWriterWalletClient() {
  return getWriterInstances().client;
}

// Distributed lock for serializing writer transactions across serverless instances.
// Uses Upstash Redis SET NX EX for acquisition and Lua script for safe release.
const WRITER_LOCK_KEY = "writer:tx:lock";
const LOCK_TTL_SECONDS = 15;
const LOCK_RETRY_DELAY_MS = 200;
const LOCK_MAX_RETRIES = 25; // 25 x 200ms = 5s max wait

async function acquireWriterLock(): Promise<string> {
  const lockId = crypto.randomUUID();
  for (let i = 0; i < LOCK_MAX_RETRIES; i++) {
    const acquired = await redis.set(WRITER_LOCK_KEY, lockId, {
      nx: true,
      ex: LOCK_TTL_SECONDS,
    });
    if (acquired === "OK") return lockId;
    await new Promise((r) => setTimeout(r, LOCK_RETRY_DELAY_MS));
  }
  throw new Error("Failed to acquire writer lock after timeout");
}

async function releaseWriterLock(lockId: string): Promise<void> {
  // Only release if we still own the lock (atomic Lua script)
  await redis.eval(
    `if redis.call("get",KEYS[1]) == ARGV[1] then return redis.call("del",KEYS[1]) else return 0 end`,
    [WRITER_LOCK_KEY],
    [lockId]
  );
}

/**
 * Execute a function while holding the distributed writer lock.
 * Ensures only one serverless instance sends writer transactions at a time.
 */
export async function withWriterLock<T>(fn: () => Promise<T>): Promise<T> {
  const lockId = await acquireWriterLock();
  try {
    return await fn();
  } finally {
    await releaseWriterLock(lockId);
  }
}
