import { TRPCError } from "@trpc/server";
import { getAddress, isAddress } from "viem";
import { generateSiweNonce, parseSiweMessage } from "viem/siwe";

import { z } from "zod";
import { ethFaucet } from "~/contracts/eth-faucet";
import { publicClient } from "~/lib/web3";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  AccountRoleType,
  AccountType,
  GasGiftStatus,
  InterfaceType,
} from "~/server/enums";

export const authRouter = createTRPCRouter({
  logout: publicProcedure.mutation(({ ctx }) => {
    console.log("Logging out")
    
    ctx.session?.destroy();
    return true;
  }),
  getNonce: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No Session Found.",
      });
    }
    if (ctx.session.nonce) return ctx.session.nonce;
    ctx.session.nonce = generateSiweNonce();
    // Save Session
    await ctx.session.save();

    // Return
    console.log(ctx.session);
    return ctx.session.nonce;
  }),
  verify: publicProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress),
        message: z.string(),
        signature: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No Session Found.",
        });
      }
      try {
        console.log(input.message);

        const valid = await publicClient.verifyMessage({
          address: input.address,
          message: input.message,
          signature: input.signature as `0x${string}`,
        });

        if (!valid) {
          throw new TRPCError({
            code: "UNPROCESSABLE_CONTENT",
            message: "Invalid message",
          });
        }
        console.log(parseSiweMessage(input.message).nonce);
        console.log(ctx.session);
        if (parseSiweMessage(input.message).nonce !== ctx.session.nonce)
          throw new TRPCError({
            code: "UNPROCESSABLE_CONTENT",
            message: "Invalid nonce.",
          });

        const user_address = getAddress(input.address);
        const userCheck = await ctx.graphDB
          .selectFrom("users")
          .innerJoin("accounts", "users.id", "accounts.user_identifier")
          .where("accounts.blockchain_address", "=", user_address)
          .select("users.id")
          .executeTakeFirst();
        let userId = userCheck?.id;
        if (!userId) {
          userId = await ctx.graphDB.transaction().execute(async (trx) => {
            const user = await trx
              .insertInto("users")
              .values({
                interface_type: InterfaceType.APP,
                interface_identifier: user_address,
                activated: true,
              })
              .returning("id")
              .executeTakeFirstOrThrow();
            await trx
              .insertInto("personal_information")
              .values({
                user_identifier: user.id,
              })
              .returning("id")
              .executeTakeFirstOrThrow();
            await trx
              .insertInto("accounts")
              .values({
                user_identifier: user.id,
                blockchain_address: user_address,
                account_type: AccountType.NON_CUSTODIAL_PERSONAL,
                account_role: AccountRoleType.USER,
              })
              .returning("id")
              .execute();
            return user.id;
          });
        }
        // Fetch Account
        const account = await ctx.graphDB
          .selectFrom("accounts")
          .where("user_identifier", "=", userId)
          .where("blockchain_address", "=", user_address)
          .select(["id", "account_role", "gas_gift_status"])
          .executeTakeFirstOrThrow();
        const info = await ctx.graphDB
          .selectFrom("personal_information")
          .where("user_identifier", "=", userId)
          .select(["given_names", "family_name"])
          .executeTakeFirstOrThrow();
        // Save Session
        const name =
          `${info.given_names || ""} ${info.family_name || ""}`.trim() ||
          "Unknown";
        ctx.session.user = {
          id: userId,
          name: name,
          firstName: info.given_names ?? "",
          lastName: info.family_name ?? "",
          account: {
            id: account.id,
            blockchain_address: user_address,
          },
          role: account.account_role as keyof typeof AccountRoleType,
        };
        await ctx.session.save();

        // Gift Gas
        if (account.gas_gift_status === GasGiftStatus.APPROVED) {
          const [canRequest, reasons] =
            await ethFaucet.canRequest(user_address);
          if (canRequest) {
            try {
              await ethFaucet.giveTo(user_address);
            } catch (error) {
              console.error(error, reasons);
            }
          }
        }
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }),
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
});
