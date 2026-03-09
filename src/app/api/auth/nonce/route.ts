import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateSiweNonce } from "viem/siwe";
import { type SessionData, sessionOptions } from "~/server/auth/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );
  const nonce = generateSiweNonce();
  session.nonce = nonce;
  await session.save();
  return NextResponse.json({ nonce });
}
