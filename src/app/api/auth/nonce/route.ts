import { randomBytes } from "crypto";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type SessionData, sessionOptions } from "~/server/auth/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );
  const nonce = randomBytes(16).toString("hex");
  session.nonce = nonce;
  await session.save();
  return NextResponse.json({ nonce });
}
