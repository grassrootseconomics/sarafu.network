import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("~/env", () => ({
  env: {
    NEXT_IRON_PASSWORD: "test-pepper",
  },
}));

const { store, redisStub, channelSend } = vi.hoisted(() => {
  const inner = new Map<string, { value: string; expiresAt: number }>();
  return {
    store: inner,
    channelSend: vi.fn(),
    redisStub: {
      set: vi.fn(
        async (
          key: string,
          value: string,
          opts?: { ex?: number }
        ): Promise<"OK"> => {
          const ttl = opts?.ex ?? 3600;
          inner.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
          return "OK";
        }
      ),
      get: vi.fn(async (key: string): Promise<string | null> => {
        const entry = inner.get(key);
        if (!entry) return null;
        if (entry.expiresAt < Date.now()) {
          inner.delete(key);
          return null;
        }
        return entry.value;
      }),
      del: vi.fn(async (key: string): Promise<number> => {
        return inner.delete(key) ? 1 : 0;
      }),
      ttl: vi.fn(async (key: string): Promise<number> => {
        const entry = inner.get(key);
        if (!entry) return -2;
        return Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000));
      }),
      // Mimics the WRONG_CODE_SCRIPT atomically: bump attempts, preserve TTL,
      // DEL on exhaustion. The Lua source is opaque here — we only honour the
      // contract: KEYS[1] is the OTP key, ARGV[1] is MAX_ATTEMPTS, ARGV[2] is
      // the fallback TTL in seconds.
      eval: vi.fn(
        async (
          _script: string,
          keys: string[],
          args: string[]
        ): Promise<"expired" | "wrong_code" | "exhausted"> => {
          const key = keys[0]!;
          const entry = inner.get(key);
          if (!entry || entry.expiresAt < Date.now()) {
            inner.delete(key);
            return "expired";
          }
          const record = JSON.parse(entry.value) as {
            attempts: number;
            codeHash: string;
            sentAt: number;
          };
          const max = Number(args[0]);
          const fallbackTtlSec = Number(args[1]);
          const next = (Number(record.attempts) || 0) + 1;
          if (next >= max) {
            inner.delete(key);
            return "exhausted";
          }
          const remainingMs = Math.max(0, entry.expiresAt - Date.now());
          const ttlMs = remainingMs > 0 ? remainingMs : fallbackTtlSec * 1000;
          inner.set(key, {
            value: JSON.stringify({ ...record, attempts: next }),
            expiresAt: Date.now() + ttlMs,
          });
          return "wrong_code";
        }
      ),
    },
  };
});

vi.mock("~/utils/cache/kv", () => ({ redis: redisStub }));
vi.mock("~/server/messaging", () => ({
  getOtpChannelForPhone: () => ({
    id: "stub-sms",
    kind: "sms" as const,
    send: channelSend,
  }),
}));

import { OtpService } from "~/server/api/services/otp-service";

beforeEach(() => {
  store.clear();
  redisStub.set.mockClear();
  redisStub.get.mockClear();
  redisStub.del.mockClear();
  redisStub.ttl.mockClear();
  redisStub.eval.mockClear();
  channelSend.mockReset();
});

describe("OtpService", () => {
  it("issuePhone stores a record, sets a 600s TTL, and dispatches the code via the channel", async () => {
    const service = new OtpService();
    await service.issuePhone("+254712345678");

    expect(channelSend).toHaveBeenCalledTimes(1);
    const sentCode = channelSend.mock.calls[0]![0].code as string;
    expect(sentCode).toMatch(/^\d{6}$/);

    expect(redisStub.set).toHaveBeenCalledTimes(1);
    const [, , opts] = redisStub.set.mock.calls[0]!;
    expect(opts).toEqual({ ex: 600 });
  });

  it("verifyPhone returns ok and deletes the record on the right code", async () => {
    const service = new OtpService();
    await service.issuePhone("+254712345678");
    const sentCode = channelSend.mock.calls[0]![0].code as string;

    const result = await service.verifyPhone("+254712345678", sentCode);
    expect(result).toEqual({ ok: true });
    expect(store.has("otp:phone:+254712345678")).toBe(false);
  });

  it("returns wrong_code and preserves the record on a wrong attempt", async () => {
    const service = new OtpService();
    await service.issuePhone("+254712345678");

    const result = await service.verifyPhone("+254712345678", "000000");
    expect(result).toEqual({ ok: false, reason: "wrong_code" });
    expect(store.has("otp:phone:+254712345678")).toBe(true);
  });

  it("returns exhausted after MAX_ATTEMPTS wrong codes and clears the record", async () => {
    const service = new OtpService();
    await service.issuePhone("+254712345678");

    // 4 wrong codes — still wrong_code, record persists
    for (let i = 0; i < 4; i++) {
      const r = await service.verifyPhone("+254712345678", "000000");
      expect(r.ok).toBe(false);
    }
    // 5th wrong code — exhausted, record gone
    const last = await service.verifyPhone("+254712345678", "000000");
    expect(last).toEqual({ ok: false, reason: "exhausted" });
    expect(store.has("otp:phone:+254712345678")).toBe(false);
  });

  it("returns expired when no record exists (TTL passed or never issued)", async () => {
    const service = new OtpService();
    const result = await service.verifyPhone("+254712345678", "123456");
    expect(result).toEqual({ ok: false, reason: "expired" });
  });

  it("does not validate the original code once the record has been consumed", async () => {
    const service = new OtpService();
    await service.issuePhone("+254712345678");
    const sentCode = channelSend.mock.calls[0]![0].code as string;

    await service.verifyPhone("+254712345678", sentCode); // ok → delete
    const second = await service.verifyPhone("+254712345678", sentCode);
    expect(second).toEqual({ ok: false, reason: "expired" });
  });
});
