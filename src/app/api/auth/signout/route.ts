import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { checkRateLimit } from "~/server/auth/check-rate-limit";
import { getClientIp } from "~/server/auth/get-ip";
import { signoutRateLimit } from "~/server/auth/rate-limit";
import { type SessionData, sessionOptions } from "~/server/auth/session";

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
