import type { SessionOptions } from "iron-session";
import { AccountRoleType } from "@grassroots/db/enums";

export const sessionOptions: SessionOptions = {
  cookieName: "siwe",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
  password: process.env.NEXT_IRON_PASSWORD as string,
};

// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions

export interface User {
  id: number;
  account: Account;
  role: (typeof AccountRoleType)[keyof typeof AccountRoleType];
  name: string;
  firstName: string;
  lastName: string;
}

export interface Account {
  id: number;
  blockchain_address: `0x${string}`;
}

export interface Session {
  nonce?: string;
  user?: User;
}

export const isAdmin = (user?: User) => {
  return user?.role === AccountRoleType.ADMIN;
};
export const isStaff = (user?: User) => {
  return user?.role === AccountRoleType.STAFF;
};
