import { type SessionOptions } from "iron-session";
import { type AccountRoleType } from "~/server/enums";

export const sessionOptions: SessionOptions = {
  cookieName: "siwe",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
  password: process.env.NEXT_IRON_PASSWORD as string,
};

// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions

export type User = {
  id: number;
  account: Account;
  role: (typeof AccountRoleType)[keyof typeof AccountRoleType];
  name: string;
  firstName: string;
  lastName: string;
};

export type Account = {
  id: number;
  blockchain_address: `0x${string}`;
};

export interface SessionData {
  nonce?: string;
  user?: User;
}
