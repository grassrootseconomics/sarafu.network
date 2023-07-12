import { TRPCError } from "@trpc/server";
import { SiweMessage, generateNonce } from "siwe";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
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
  logout: publicProcedure.query(({ ctx }) => {
    ctx.session?.destroy();
    return true;
  }),
  nonce: publicProcedure.query(async ({ ctx }) => {
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

        ctx.session.siwe = data;
        await ctx.session.save();
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }),
  me: publicProcedure.query(({ ctx }) => {
    return ctx?.session?.siwe ?? null;
  }),
});
