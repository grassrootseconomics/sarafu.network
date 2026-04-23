import * as Sentry from "@sentry/nextjs";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type Hex } from "viem";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { publicClient } from "@sarafu/contracts/chain";
import { createAuthToken } from "@sarafu/api/auth";
import { checkRateLimit } from "@sarafu/api/auth/check-rate-limit";
import { getClientIp } from "@sarafu/api/auth/get-ip";
import { verifyRateLimit } from "@sarafu/api/auth/rate-limit";
import { type SessionData, sessionOptions } from "@sarafu/api/auth/session";

export async function POST(req: Request) {
  const ip = await getClientIp();
  const rateLimited = await checkRateLimit(verifyRateLimit, ip);
  if (rateLimited) return rateLimited;

  try {
    const { message, signature } = (await req.json()) as {
      message: string;
      signature: string;
    };

    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    const parsed = parseSiweMessage(message);
    if (!parsed.address || !parsed.nonce) {
      return NextResponse.json(
        { ok: false, error: "Invalid SIWE message" },
        { status: 400 }
      );
    }

    // Verify nonce matches the one stored in session
    if (parsed.nonce !== session.nonce) {
      return NextResponse.json(
        { ok: false, error: "Invalid nonce" },
        { status: 400 }
      );
    }

    // Verify nonce has not expired (5 minute TTL)
    const NONCE_TTL_MS = 5 * 60 * 1000;
    if (
      !session.nonceCreatedAt ||
      Date.now() - session.nonceCreatedAt > NONCE_TTL_MS
    ) {
      return NextResponse.json(
        { ok: false, error: "Nonce expired" },
        { status: 400 }
      );
    }

    const expectedDomain = req.headers.get("host");
    if (!expectedDomain) {
      return NextResponse.json(
        { ok: false, error: "Missing host header" },
        { status: 400 }
      );
    }
    const isValid = await verifySiweMessage(publicClient, {
      message,
      signature: signature as Hex,
      domain: expectedDomain,
    });

    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Set session data
    const address = parsed.address;
    const chainId = parsed.chainId ?? 42220; // Celo mainnet default
    session.address = address;
    session.chainId = chainId;
    delete session.nonce;
    delete session.nonceCreatedAt;
    await session.save();

    // Return a sealed token for non-cookie clients (e.g. mobile)
    const token = await createAuthToken(address, chainId);

    return NextResponse.json({ ok: true, token });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: "auth", endpoint: "verify" },
    });
    console.error("SIWE verification failed:", error);
    return NextResponse.json(
      { ok: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
