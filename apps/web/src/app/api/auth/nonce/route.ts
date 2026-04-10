import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateSiweNonce } from "viem/siwe";
import { checkRateLimit } from "@sarafu/api/auth/check-rate-limit";
import { getClientIp } from "@sarafu/api/auth/get-ip";
import { nonceRateLimit } from "@sarafu/api/auth/rate-limit";
import { type SessionData, sessionOptions } from "@sarafu/api/auth/session";

export async function GET() {
  const ip = await getClientIp();
  const rateLimited = await checkRateLimit(nonceRateLimit, ip);
  if (rateLimited) return rateLimited;

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );
  const nonce = generateSiweNonce();
  session.nonce = nonce;
  session.nonceCreatedAt = Date.now();
  await session.save();
  return NextResponse.json({ nonce });
}
