import { type IronSessionOptions } from "iron-session";
import { type AccountRoleType } from "~/server/enums";

export const ironOptions: IronSessionOptions = {
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
};

export type Account = {
  id: number;
  blockchain_address: `0x${string}`;
};
// This is where we specify the typings of req.session.*
declare module "iron-session" {
  interface IronSessionData {
    nonce?: string;
    user?: User;
  }
}
