import { TRPCError } from "@trpc/server";
import { SiweMessage, generateNonce } from "siwe";
import { getAddress } from "viem";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { AccountRoleType, AccountType, InterfaceType } from "~/server/enums";

const messageSchema = z.object({
  domain: z.string(),
  address: z.string(),
  statement: z.string().optional(),
  uri: z.string(),
  version: z.string(),
  chainId: z.number(),
  nonce: z.string(),
  issuedAt: z.string().optional(),
  notBefore: z.string().optional(),
  requestId: z.string().optional(),
  resources: z.array(z.string()).optional(),
  signature: z.string().optional(),
  type: z.literal("Personal signature").optional(),
});
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
    ctx.session.nonce = generateNonce();
    // Save Session
    await ctx.session.save();

    // Return
    return ctx.session.nonce;
  }),
  verify: publicProcedure
    .input(
      z.object({
        message: messageSchema,
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
        const siweMessage = new SiweMessage(input.message);
        const { success, error, data } = await siweMessage.verify({
          signature: input.signature,
        });

        if (!success) throw error;

        if (data.nonce !== ctx.session.nonce)
          throw new TRPCError({
            code: "UNPROCESSABLE_CONTENT",
            message: "Invalid nonce.",
          });

        const user_address = getAddress(data.address);
        const userCheck = await ctx.kysely
          .selectFrom("users")
          .innerJoin("accounts", "users.id", "accounts.user_identifier")
          .where("accounts.blockchain_address", "=", data.address)
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
          .select(["id", "account_role"])
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
