import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type Hex } from "viem";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { publicClient } from "~/config/viem.config.server";
import { type SessionData, sessionOptions } from "~/server/auth/session";

export async function POST(req: Request) {
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
    session.address = parsed.address;
    session.chainId = parsed.chainId ?? 42220; // Celo mainnet default
    delete session.nonce; // Clear nonce after use
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SIWE verification failed:", error);
    return NextResponse.json(
      { ok: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
