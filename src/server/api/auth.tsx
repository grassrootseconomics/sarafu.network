import type { NextAuthConfig, Session } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cache } from "react";
import { type Hex } from "viem";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { ethFaucet } from "~/contracts/eth-faucet";
import { publicClient } from "../client";
import { graphDB } from "../db";
import { type Point } from "../db/db";
import { GasGiftStatus, type AccountRoleType } from "../enums";
import { UserModel } from "./models/user";

declare module "next-auth" {
  interface Session {
    address: `0x${string}`;
    chainId: number;
    user: {
      id: number;
      default_voucher: string | null;
      family_name: string | null;
      gender: string | null;
      geo: Point | null;
      given_names: string | null;
      location_name: string | null;
      year_of_birth: number | null;
      role: keyof typeof AccountRoleType;
      account_id: number;
      vpa?: string | undefined;
    };
  }
}
const nextAuthSecret = process.env.NEXT_IRON_PASSWORD as string;
if (!nextAuthSecret) {
  throw new Error("NEXT_IRON_PASSWORD is not set");
}
const providers = [
  CredentialsProvider({
    name: "Ethereum",
    credentials: {
      message: {
        label: "Message",
        type: "text",
        placeholder: "0x0",
      },
      signature: {
        label: "Signature",
        type: "text",
        placeholder: "0x0",
      },
    },
    async authorize(credentials) {
      try {
        if (!credentials?.message || typeof credentials.message !== "string") {
          throw new Error("SiweMessage is undefined");
        }
        if (
          !credentials?.signature ||
          typeof credentials.signature !== "string"
        ) {
          throw new Error("SiweSignature is undefined");
        }
        const message = parseSiweMessage(credentials.message);
        if (!message.address) {
          throw new Error("Address is undefined");
        }
        const isValid = await verifySiweMessage(publicClient, {
          message: credentials.message,
          signature: credentials.signature as Hex,
        });
        // Get user from DB
        if (isValid) {
          return {
            id: `${message.chainId}:${message.address}`,
          };
        }

        return null;
      } catch (e) {
        console.error("SIWE authorization failed:", e);
        return null;
      }
    },
  }),
];

export const {
  handlers,
  auth: uncachedAuth,
  signIn,
  signOut,
} = NextAuth({
  providers: providers,
  // https://next-auth.js.org/configuration/providers/oauth
  secret: nextAuthSecret,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async session({ session, token }) {
      if (!token.sub) {
        return session;
      }
      const [chainId, address] = token.sub.split(":");
      if (chainId && address) {
        session.address = address as `0x${string}`;
        session.chainId = parseInt(chainId, 10);
        const userModel = new UserModel(graphDB);

        try {
          const userCheck = await userModel.findUserByAddress(session.address);
          let userId = userCheck?.id;
          if (!userId) {
            userId = await userModel.createUser(session.address);
          }

          const infoP = userModel.getUserInfo(userId);
          const vpaP = userModel.getVPA(userId);
          const [info, vpa] = await Promise.all([infoP, vpaP]);
          const user = { vpa: vpa, ...info, email: "", emailVerified: false };

          // Gas Check
          if (info.gas_status === GasGiftStatus.APPROVED) {
            const [canRequest, reasons] = await ethFaucet.canRequest(
              session.address
            );
            if (canRequest) {
              try {
                await ethFaucet.giveTo(session.address);
              } catch (error) {
                console.error("Failed to give gas:", error, reasons);
              }
            }
          }

          // @ts-expect-error - This is a hack to get around the fact that the user object is not being properly typed
          session.user = user;
        } catch (error) {
          console.error("Error in session callback:", error);
          // Should still return a valid session with minimal data
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig);

export const auth = cache(uncachedAuth);

export async function SignedIn(props: {
  children:
    | React.ReactNode
    | ((props: { user: Session["user"] }) => React.ReactNode);
}) {
  const sesh = await auth();
  return sesh?.user ? (
    <>
      {typeof props.children === "function"
        ? props.children({ user: sesh.user })
        : props.children}
    </>
  ) : null;
}

export async function SignedOut(props: { children: React.ReactNode }) {
  const sesh = await auth();
  return sesh?.user ? null : <>{props.children}</>;
}
