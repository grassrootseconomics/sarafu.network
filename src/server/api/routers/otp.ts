import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  assertRateOk,
  otpRequestRateLimit,
  otpVerifyRateLimit,
} from "~/server/auth/rate-limit";
import { OtpDispatchError } from "~/server/messaging";
import { UserModel } from "~/server/api/models/user";
import { otpService } from "~/server/api/services/otp-service";
import { authenticatedProcedure, router } from "~/server/api/trpc";
import { redis } from "~/utils/cache/kv";
import { makePhoneNumberSchema } from "~/utils/phone-number";

const phoneSchema = makePhoneNumberSchema("KE");
const codeSchema = z.string().regex(/^\d{6}$/, "Enter the 6-digit code");

export const otpRouter = router({
  requestPhone: authenticatedProcedure
    .input(z.object({ phone: phoneSchema }))
    .mutation(async ({ ctx, input }) => {
      await assertRateOk(
        otpRequestRateLimit,
        `phone-${input.phone}`,
        ctx.ip ? `ip-${ctx.ip}` : ""
      );
      try {
        await otpService.issuePhone(input.phone);
      } catch (err) {
        if (err instanceof OtpDispatchError) {
          throw new TRPCError({
            code: err.code === "bad_request" ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR",
            message: err.description,
          });
        }
        throw err;
      }
      return { sent: true };
    }),

  verifyPhone: authenticatedProcedure
    .input(z.object({ phone: phoneSchema, code: codeSchema }))
    .mutation(async ({ ctx, input }) => {
      await assertRateOk(otpVerifyRateLimit, `phone-${input.phone}`);
      const result = await otpService.verifyPhone(input.phone, input.code);
      if (!result.ok) {
        const messages = {
          expired: "Code expired. Request a new one.",
          wrong_code: "Wrong code. Try again.",
          exhausted: "Too many wrong attempts. Request a new code.",
        } as const;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: messages[result.reason],
        });
      }
      const userModel = new UserModel(ctx);
      await userModel.setPhoneVerified(ctx.session.user.id, input.phone);
      await redis.del(`auth:session:${ctx.session.address}`);
      return { verified: true, phone: input.phone };
    }),
});
