import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { checkRateLimit } from "~/server/auth/check-rate-limit";
import { getClientIp } from "~/server/auth/get-ip";
import { sessionRateLimit } from "~/server/auth/rate-limit";

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
