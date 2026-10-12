import * as Sentry from "@sentry/nextjs";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type Hex } from "viem";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { publicClient } from "~/config/viem.config.server";
import {
  ACCOUNT_CREATION_DISABLED_CODE,
  CREATION_DISABLED_MESSAGE,
} from "~/lib/migration";
import { UserModel } from "~/server/api/models/user";
import { checkRateLimit } from "~/server/auth/check-rate-limit";
import { getClientIp } from "~/server/auth/get-ip";
import { verifyRateLimit } from "~/server/auth/rate-limit";
import { type SessionData, sessionOptions } from "~/server/auth/session";
import { federatedDB, graphDB } from "~/server/db";

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

    const userModel = new UserModel({ graphDB, federatedDB });
    const existingUser = await userModel.findUserByAddress(parsed.address);
    if (!existingUser) {
      delete session.address;
      delete session.chainId;
      delete session.nonce;
      delete session.nonceCreatedAt;
      await session.save();

      return NextResponse.json(
        {
          ok: false,
          code: ACCOUNT_CREATION_DISABLED_CODE,
          error: CREATION_DISABLED_MESSAGE,
        },
        { status: 403 },
      );
    }

    // Set session data
    session.address = parsed.address;
    session.chainId = parsed.chainId ?? 42220; // Celo mainnet default
    delete session.nonce;
    delete session.nonceCreatedAt;
    await session.save();

    return NextResponse.json({ ok: true });
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
