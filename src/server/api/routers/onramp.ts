import { TRPCError } from "@trpc/server";
import { getAddress } from "viem";
import { z } from "zod";
import {
  getRates,
  getTransactionsByAddress,
  PretiumError,
  triggerOnramp,
  type PretiumErrorCode,
} from "~/lib/sarafu/pretium";
import { UserModel } from "~/server/api/models/user";
import { authenticatedProcedure, router } from "~/server/api/trpc";
import {
  assertRateOk,
  onrampTriggerRateLimit,
} from "~/server/auth/rate-limit";
import { cacheQuery } from "~/utils/cache/cacheQuery";
import {
  InvalidMsisdnError,
  normalizePhoneNumber,
  toMsisdn,
} from "~/utils/phone-number";

const errorCodeMap: Record<PretiumErrorCode, TRPCError["code"]> = {
  bad_request: "BAD_REQUEST",
  not_found: "NOT_FOUND",
  upstream: "INTERNAL_SERVER_ERROR",
};

function toTRPCError(err: unknown): never {
  if (err instanceof PretiumError) {
    throw new TRPCError({
      code: errorCodeMap[err.code],
      message: err.description,
      cause: err,
    });
  }
  throw err;
}

export const onrampRouter = router({
  getRates: authenticatedProcedure.query(
    cacheQuery(60, async () => {
      try {
        return await getRates();
      } catch (err) {
        toTRPCError(err);
      }
    })
  ),

  trigger: authenticatedProcedure
    .input(
      z.object({
        phoneNumber: z.string().min(1).transform((v, ctx) => {
          try {
            return toMsisdn(v);
          } catch (err) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                err instanceof InvalidMsisdnError
                  ? "Enter a valid Kenyan phone number"
                  : "Invalid phone number",
            });
            return z.NEVER;
          }
        }),
        asset: z.enum(["USDT", "USDC", "cUSD"]),
        amount: z.number().min(100).max(250_000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertRateOk(
        onrampTriggerRateLimit,
        `wallet-${ctx.session.address}`
      );
      const userModel = new UserModel(ctx);
      const info = await userModel.getUserInfo(ctx.session.user.id);
      if (!info.phone_verified_at) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Verify your phone number before adding funds.",
        });
      }
      const savedE164 = normalizePhoneNumber(info.phone_number ?? "", "KE");
      const inputE164 = normalizePhoneNumber(input.phoneNumber, "KE");
      if (!savedE164 || savedE164 !== inputE164) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Phone number does not match your verified number.",
        });
      }
      try {
        return await triggerOnramp({
          address: getAddress(ctx.session.address),
          phoneNumber: input.phoneNumber,
          asset: input.asset,
          amount: input.amount,
        });
      } catch (err) {
        toTRPCError(err);
      }
    }),

  transactions: authenticatedProcedure.query(async ({ ctx }) => {
    try {
      return await getTransactionsByAddress(getAddress(ctx.session.address));
    } catch (err) {
      toTRPCError(err);
    }
  }),
});
