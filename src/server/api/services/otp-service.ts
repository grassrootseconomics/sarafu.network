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

// Atomically bumps `attempts` for an OTP record, preserving the original TTL.
// Returns "expired" if the record is missing, "exhausted" if the bumped count
// reaches MAX_ATTEMPTS (and DELs the key), otherwise "wrong_code".
const WRONG_CODE_SCRIPT = `
local raw = redis.call("GET", KEYS[1])
if not raw then return "expired" end
local ok, record = pcall(cjson.decode, raw)
if not ok or type(record) ~= "table" then return "expired" end
record.attempts = (tonumber(record.attempts) or 0) + 1
if record.attempts >= tonumber(ARGV[1]) then
  redis.call("DEL", KEYS[1])
  return "exhausted"
end
local ttl = redis.call("PTTL", KEYS[1])
if ttl <= 0 then ttl = tonumber(ARGV[2]) * 1000 end
redis.call("SET", KEYS[1], cjson.encode(record), "PX", ttl)
return "wrong_code"
`;

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
      const outcome = await redis.eval<
        [string, string],
        "expired" | "wrong_code" | "exhausted"
      >(WRONG_CODE_SCRIPT, [key], [String(MAX_ATTEMPTS), String(TTL_SECONDS)]);
      if (outcome === "exhausted") return { ok: false, reason: "exhausted" };
      if (outcome === "expired") return { ok: false, reason: "expired" };
      return { ok: false, reason: "wrong_code" };
    }

    await redis.del(key);
    return { ok: true };
  }
}

export const otpService = new OtpService();
