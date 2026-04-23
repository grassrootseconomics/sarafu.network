import { type Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<NextResponse | null> {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(
      identifier
    );
    if (!success) {
      return NextResponse.json(
        { ok: false, error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil(
              (reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }
    return null;
  } catch {
    // Fail open: if Redis is down, allow the request
    return null;
  }
}
