import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { cache } from "react";
import { publicClient } from "~/config/viem.config.server";
import { EthFaucet } from "~/contracts/eth-faucet";
import { graphDB } from "~/server/db";
import { GasGiftStatus } from "~/server/enums";
import { UserModel } from "~/server/api/models/user";
import { type SessionData, sessionOptions } from "./session";
import { type AppSession } from "./types";

async function _getSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );

  if (!session.address || !session.chainId) {
    return null;
  }

  const userModel = new UserModel(graphDB);

  try {
    const userCheck = await userModel.findUserByAddress(session.address);
    let userId = userCheck?.id;
    if (!userId) {
      userId = await userModel.createUser(session.address);
    }

    const info = await userModel.getUserInfo(userId);

    // Gas faucet check
    if (info.gas_status === GasGiftStatus.APPROVED) {
      const ethFaucet = new EthFaucet(publicClient);
      const [canRequest, reasons] = await ethFaucet.canRequest(session.address);
      if (canRequest) {
        try {
          await ethFaucet.giveTo(session.address);
        } catch (error) {
          console.error("Failed to give gas:", error, reasons);
        }
      }
    }

    return {
      address: session.address,
      chainId: session.chainId,
      user: {
        id: info.id,
        default_voucher: info.default_voucher,
        family_name: info.family_name,
        gender: info.gender,
        geo: info.geo,
        given_names: info.given_names,
        location_name: info.location_name,
        year_of_birth: info.year_of_birth,
        role: info.role,
        account_id: info.account_id,
      },
    };
  } catch (error) {
    console.error("Error in session enrichment:", error);
    return null;
  }
}

export const auth = cache(_getSession);
