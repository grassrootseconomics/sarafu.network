import { type IronSessionOptions } from "iron-session";
import { type SiweMessage } from "siwe";

export const ironOptions: IronSessionOptions = {
  cookieName: "siwe",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
  password: process.env.NEXT_IRON_PASSWORD as string,
};

// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions

export type User = {
  isLoggedIn: boolean;
  login: string;
  avatarUrl: string;
};

// This is where we specify the typings of req.session.*
declare module "iron-session" {
  interface IronSessionData {
    nonce?: string;
    siwe?: SiweMessage;
  }
}
