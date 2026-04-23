import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@sarafu/api/auth/check-rate-limit";
import { getClientIp } from "@sarafu/api/auth/get-ip";
import { signoutRateLimit } from "@sarafu/api/auth/rate-limit";
import { type SessionData, sessionOptions } from "@sarafu/api/auth/session";

export async function POST() {
  const ip = await getClientIp();
  const rateLimited = await checkRateLimit(signoutRateLimit, ip);
  if (rateLimited) return rateLimited;

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );
  session.destroy();
  return NextResponse.json({ ok: true });
}
