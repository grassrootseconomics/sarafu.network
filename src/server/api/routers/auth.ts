import { generateSiweNonce, parseSiweMessage } from "viem/siwe";

import { TRPCError } from "@trpc/server";
import { getAddress } from "viem";
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
    ctx.session.nonce = generateSiweNonce();
    // Save Session
    await ctx.session.save();

    // Return
    return ctx.session.nonce;
  }),
  verify: publicProcedure
    .input(
      z.object({
        message: z.string(),
        signature: z
          .string()
          .refine((sig) => sig.startsWith("0x"))
          .transform((sig) => sig as `0x${string}`),
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
        const valid = await publicClient.verifySiweMessage(input);

        if (!valid)
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid Signature.",
          });
        const message = parseSiweMessage(input.message);

        if (!message.nonce || message.nonce !== ctx.session.nonce)
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid Nonce.",
          });
        if (!message.address)
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid Address.",
          });
        const user_address = getAddress(message.address);
        const userCheck = await ctx.kysely
          .selectFrom("users")
          .innerJoin("accounts", "users.id", "accounts.user_identifier")
          .where("accounts.blockchain_address", "=", message.address)
          .select("users.id")
          .executeTakeFirst();
        let userId = userCheck?.id;
        if (!userId) {
          userId = await ctx.kysely.transaction().execute(async (trx) => {
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
        const account = await ctx.kysely
          .selectFrom("accounts")
          .where("user_identifier", "=", userId)
          .where("blockchain_address", "=", user_address)
          .select(["id", "account_role", "gas_gift_status"])
          .executeTakeFirstOrThrow();
        const info = await ctx.kysely
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
          account: {
            id: account.id,
            blockchain_address: user_address,
          },
          role: account.account_role as keyof typeof AccountRoleType,
        };

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
        await ctx.session.save();
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
