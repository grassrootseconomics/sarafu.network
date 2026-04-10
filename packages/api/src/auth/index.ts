import * as Sentry from "@sentry/nextjs";
import { getIronSession, sealData, unsealData } from "iron-session";
import { cookies } from "next/headers";
import { cache } from "react";
import { publicClient } from "@sarafu/contracts/chain";
import { EthFaucet } from "@sarafu/contracts/abi/eth-faucet/index";
import { withWriterLock } from "@sarafu/contracts/writer";
import { UserModel } from "../models/user";
import { federatedDB, graphDB } from "../db";
import { GasGiftStatus } from "@sarafu/core/enums";
import { cacheWithExpiry } from "../cache/cache";
import { type SessionData, sessionOptions } from "./session";
import { type AppSession } from "./types";

async function enrichSession(
  address: `0x${string}`,
  chainId: number
): Promise<AppSession | null> {
  try {
    return await cacheWithExpiry<AppSession>(
      `auth:session:${address}`,
      60,
      async () => {
        const userModel = new UserModel({ graphDB, federatedDB });
        const userCheck = await userModel.findUserByAddress(address);
        let userId = userCheck?.id;
        if (!userId) {
          userId = await userModel.createUser(address);
        }

        const info = await userModel.getUserInfo(userId);

        // Gas faucet check (idempotent - canRequest returns false after gas is given)
        if (info.gas_status === GasGiftStatus.APPROVED) {
          const ethFaucet = new EthFaucet(publicClient);
          const [canRequest, reasons] =
            await ethFaucet.canRequest(address);
          if (canRequest) {
            try {
              await withWriterLock(() =>
                ethFaucet.submitGiveTo(address)
              );
            } catch (error) {
              Sentry.captureException(error, {
                tags: { component: "auth", action: "gas-faucet" },
                extra: { address, reasons },
              });
              console.error("Failed to give gas:", error, reasons);
            }
          }
        }

        return {
          address,
          chainId,
          user: {
            id: info.id,
            default_voucher: info.default_voucher,
            family_name: info.family_name,
            gender: info.gender,
            geo: info.geo,
            given_names: info.given_names,
            location_name: info.location_name,
            year_of_birth: info.year_of_birth,
            onboarding_completed: info.onboarding_completed ?? false,
            role: info.role,
            account_id: info.account_id,
          },
        };
      }
    );
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: "auth", action: "session-enrichment" },
    });
    console.error("Error in session enrichment:", error);
    return null;
  }
}

async function _getSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );

  if (!session.address || !session.chainId) {
    return null;
  }

  return enrichSession(session.address, session.chainId);
}

export const auth = cache(_getSession);

const AUTH_TOKEN_TTL = 60 * 60 * 24 * 30; // 30 days, matches cookie maxAge

export async function createAuthToken(
  address: `0x${string}`,
  chainId: number
): Promise<string> {
  return sealData(
    { address, chainId },
    { password: sessionOptions.password, ttl: AUTH_TOKEN_TTL }
  );
}

export async function getSessionFromToken(
  token: string
): Promise<AppSession | null> {
  try {
    const data = await unsealData<SessionData>(token, {
      password: sessionOptions.password,
    });
    if (!data.address || !data.chainId) return null;
    return enrichSession(data.address, data.chainId);
  } catch {
    return null;
  }
}
