import { Ratelimit } from "@upstash/ratelimit";
import { TRPCError } from "@trpc/server";
import { redis } from "~/utils/cache/kv";

export const nonceRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "rl:auth:nonce",
});

export const verifyRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "rl:auth:verify",
});

export const sessionRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  prefix: "rl:auth:session",
});

export const signoutRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "rl:auth:signout",
});

export const otpRequestRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "60 s"),
  prefix: "rl:otp:request",
});

export const otpVerifyRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "rl:otp:verify",
});

export const onrampTriggerRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "300 s"),
  prefix: "rl:onramp:trigger",
});

/**
 * tRPC-flavoured rate-limit check. Hits `limiter.limit(key)` for each key in
 * `identifiers`; the first refusal throws `TOO_MANY_REQUESTS`. Fails open if
 * Redis is unreachable (matches `checkRateLimit` behaviour for HTTP routes).
 */
export async function assertRateOk(
  limiter: Ratelimit,
  ...identifiers: string[]
): Promise<void> {
  for (const id of identifiers) {
    if (!id) continue;
    try {
      const { success, reset } = await limiter.limit(id);
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Try again in ${Math.max(1, Math.ceil((reset - Date.now()) / 1000))}s.`,
        });
      }
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      // Fail open on Redis errors.
    }
  }
}
