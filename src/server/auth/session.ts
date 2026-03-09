import { type SessionOptions } from "iron-session";
import { env } from "~/env";

export interface SessionData {
  chainId?: number;
  address?: `0x${string}`;
  nonce?: string;
}

export const sessionOptions: SessionOptions = {
  password: env.NEXT_IRON_PASSWORD,
  cookieName: "sarafu_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
