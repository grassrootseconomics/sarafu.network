import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { type Hex } from "viem";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { publicClient } from "@sarafu/contracts/chain";
import { createAuthToken } from "@sarafu/api/auth";
import { checkRateLimit } from "@sarafu/api/auth/check-rate-limit";
import { getClientIp } from "@sarafu/api/auth/get-ip";
import { verifyRateLimit } from "@sarafu/api/auth/rate-limit";
import { redis } from "@sarafu/api/cache/kv";

export async function POST(req: Request) {
  const ip = await getClientIp();
  const rateLimited = await checkRateLimit(verifyRateLimit, ip);
  if (rateLimited) return rateLimited;

  try {
    const deviceId = req.headers.get("x-device-id");
    if (!deviceId || deviceId.length < 16 || deviceId.length > 128) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid X-Device-Id header" },
        { status: 400 }
      );
    }

    const { message, signature } = (await req.json()) as {
      message: string;
      signature: string;
    };

    const parsed = parseSiweMessage(message);
    if (!parsed.address || !parsed.nonce) {
      return NextResponse.json(
        { ok: false, error: "Invalid SIWE message" },
        { status: 400 }
      );
    }

    // Retrieve and consume the nonce from Redis (one-time use)
    const redisKey = `auth:mobile:nonce:${deviceId}`;
    const stored = await redis.get<{ nonce: string; createdAt: number }>(
      redisKey
    );

    if (!stored || stored.nonce !== parsed.nonce) {
      return NextResponse.json(
        { ok: false, error: "Invalid nonce" },
        { status: 400 }
      );
    }

    // Delete nonce immediately to prevent replay
    await redis.del(redisKey);

    // Verify nonce TTL
    const NONCE_TTL_MS = 5 * 60 * 1000;
    if (Date.now() - stored.createdAt > NONCE_TTL_MS) {
      return NextResponse.json(
        { ok: false, error: "Nonce expired" },
        { status: 400 }
      );
    }

    // Verify SIWE signature — skip domain validation for mobile clients
    const isValid = await verifySiweMessage(publicClient, {
      message,
      signature: signature as Hex,
    });

    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    const address = parsed.address;
    const chainId = parsed.chainId ?? 42220;
    const token = await createAuthToken(address, chainId);

    return NextResponse.json({ ok: true, token });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: "auth", endpoint: "mobile-verify" },
    });
    console.error("Mobile SIWE verification failed:", error);
    return NextResponse.json(
      { ok: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
