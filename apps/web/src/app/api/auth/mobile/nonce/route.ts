import { NextResponse } from "next/server";
import { generateSiweNonce } from "viem/siwe";
import { checkRateLimit } from "@sarafu/api/auth/check-rate-limit";
import { getClientIp } from "@sarafu/api/auth/get-ip";
import { nonceRateLimit } from "@sarafu/api/auth/rate-limit";
import { redis } from "@sarafu/api/cache/kv";

const NONCE_TTL_SECONDS = 300; // 5 minutes

export async function GET(req: Request) {
  const ip = await getClientIp();
  const rateLimited = await checkRateLimit(nonceRateLimit, ip);
  if (rateLimited) return rateLimited;

  const deviceId = req.headers.get("x-device-id");
  if (!deviceId || deviceId.length < 16 || deviceId.length > 128) {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid X-Device-Id header" },
      { status: 400 }
    );
  }

  const nonce = generateSiweNonce();
  await redis.set(
    `auth:mobile:nonce:${deviceId}`,
    { nonce, createdAt: Date.now() },
    { ex: NONCE_TTL_SECONDS }
  );

  return NextResponse.json({ nonce });
}
