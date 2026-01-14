import { TRPCError } from "@trpc/server";

export const NO_USER_FOUND_ERROR = new TRPCError({
  code: "NOT_FOUND",
  message: "User not found",
});