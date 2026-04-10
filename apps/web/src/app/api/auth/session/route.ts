import { NextResponse } from "next/server";
import { auth } from "@sarafu/api/auth";
import { checkRateLimit } from "@sarafu/api/auth/check-rate-limit";
import { getClientIp } from "@sarafu/api/auth/get-ip";
import { sessionRateLimit } from "@sarafu/api/auth/rate-limit";

export async function GET() {
  const ip = await getClientIp();
  const rateLimited = await checkRateLimit(sessionRateLimit, ip);
  if (rateLimited) return rateLimited;

  const session = await auth();
  return NextResponse.json(
    { session },
    {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    }
  );
}
