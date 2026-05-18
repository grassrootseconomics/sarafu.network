import { createHash, randomInt } from "node:crypto";
import { env } from "~/env";
import { getOtpChannelForPhone } from "~/server/messaging";
import { redis } from "~/utils/cache/kv";

const TTL_SECONDS = 600; // 10 minutes
const MAX_ATTEMPTS = 5;

interface OtpRecord {
  codeHash: string;
  attempts: number;
  sentAt: number;
}

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; reason: "expired" | "wrong_code" | "exhausted" };

function phoneKey(e164: string): string {
  return `otp:phone:${e164}`;
}

function hashCode(code: string): string {
  return createHash("sha256")
    .update(`${code}:${env.NEXT_IRON_PASSWORD}`)
    .digest("hex");
}

function generateCode(): string {
  return String(randomInt(100000, 1000000));
}

export class OtpService {
  async issuePhone(e164: string): Promise<void> {
    const code = generateCode();
    const record: OtpRecord = {
      codeHash: hashCode(code),
      attempts: 0,
      sentAt: Date.now(),
    };
    await redis.set(phoneKey(e164), JSON.stringify(record), {
      ex: TTL_SECONDS,
    });
    const channel = getOtpChannelForPhone();
    await channel.send({
      destination: e164,
      code,
      ttlSeconds: TTL_SECONDS,
    });
  }

  async verifyPhone(e164: string, code: string): Promise<OtpVerifyResult> {
    const key = phoneKey(e164);
    const raw = await redis.get(key);
    if (raw === null || raw === undefined) {
      return { ok: false, reason: "expired" };
    }
    const record: OtpRecord =
      typeof raw === "string" ? (JSON.parse(raw) as OtpRecord) : (raw as OtpRecord);

    if (record.attempts >= MAX_ATTEMPTS) {
      await redis.del(key);
      return { ok: false, reason: "exhausted" };
    }

    if (record.codeHash !== hashCode(code)) {
      const updated: OtpRecord = { ...record, attempts: record.attempts + 1 };
      if (updated.attempts >= MAX_ATTEMPTS) {
        await redis.del(key);
        return { ok: false, reason: "exhausted" };
      }
      // Preserve remaining TTL so attackers can't refresh the window by retrying.
      const ttl = await redis.ttl(key);
      await redis.set(key, JSON.stringify(updated), {
        ex: ttl > 0 ? ttl : TTL_SECONDS,
      });
      return { ok: false, reason: "wrong_code" };
    }

    await redis.del(key);
    return { ok: true };
  }
}

export const otpService = new OtpService();
