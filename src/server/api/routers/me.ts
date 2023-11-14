import { TRPCError } from "@trpc/server";
import { isAddress } from "viem";
import { UserProfileFormSchema } from "~/components/users/forms/profile-form";
import { authenticatedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { GasGiftStatus } from "~/server/enums";

export const meRouter = createTRPCRouter({
  get: authenticatedProcedure.query(async ({ ctx }) => {
    const address = ctx.session?.user?.account.blockchain_address;
    if (!address)
      throw new TRPCError({ code: "BAD_REQUEST", message: "No user found" });
    const userCheck = await ctx.kysely
      .selectFrom("users")
      .innerJoin("accounts", "users.id", "accounts.user_identifier")
      .where("accounts.blockchain_address", "=", address)
      .select("users.id")
      .executeTakeFirst();
    if (!userCheck)
      throw new TRPCError({ code: "BAD_REQUEST", message: "No user found" });
    const userId = userCheck.id;
    const info = await ctx.kysely
      .selectFrom("personal_information")
      .where("user_identifier", "=", userId)
      .select([
        "given_names",
        "family_name",
        "gender",
        "year_of_birth",
        "location_name",
        "geo",
      ])
      .executeTakeFirstOrThrow();
    return info;
  }),

  update: authenticatedProcedure
    .input(UserProfileFormSchema)
    .mutation(async ({ ctx, input }) => {
      const address = ctx.session?.user?.account.blockchain_address;
      if (!address) throw new Error("No user found");
      const userCheck = await ctx.kysely
        .selectFrom("users")
        .innerJoin("accounts", "users.id", "accounts.user_identifier")
        .where("accounts.blockchain_address", "=", address)
        .select("users.id")
        .executeTakeFirst();
      if (!userCheck) throw new Error("No user found");
      const userId = userCheck.id;
      await ctx.kysely
        .updateTable("personal_information")
        .set(input)
        .where("user_identifier", "=", userId)
        .execute();
      return true;
    }),
  vouchers: authenticatedProcedure.query(async ({ ctx }) => {
    const address = ctx.session?.user?.account.blockchain_address;
    if (!address || !isAddress(address)) {
      return [];
    }
    const result = await ctx.kysely
      .selectFrom("vouchers")
      .selectAll()
      .where(
        "voucher_address",
        "in",
        ctx.kysely
          .selectFrom("transactions")
          .select("voucher_address")
          .where((eb) =>
            eb.or([
              eb("sender_address", "=", address),
              eb("recipient_address", "=", address),
            ])
          )
          .distinct()
      )
      .execute();

    return result;
  }),

  requestGas: authenticatedProcedure.mutation(async ({ ctx }) => {
    const address = ctx.session?.user?.account?.blockchain_address;
    if (!address || !isAddress(address)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid address",
      });
    }
    const account = await ctx.kysely
      .selectFrom("accounts")
      .where("blockchain_address", "=", address)
      .select(["id", "gas_gift_status"])
      .executeTakeFirstOrThrow();
    if (account.gas_gift_status === GasGiftStatus.REJECTED)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Sorry your request has been rejected.",
      });
    if (account.gas_gift_status === GasGiftStatus.REQUESTED)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Sorry your request is pending.",
      });
    if (account.gas_gift_status === GasGiftStatus.APPROVED) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You are already approved.",
      });
    }
    await ctx.kysely
      .updateTable("accounts")
      .set({ gas_gift_status: GasGiftStatus.REQUESTED })
      .where("id", "=", account.id)
      .execute();
    return {
      message: "Request sent successfully.",
    };
  }),
  gasStatus: authenticatedProcedure.query(async ({ ctx }) => {
    const address = ctx.session?.user?.account?.blockchain_address;
    if (!address || !isAddress(address)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid address",
      });
    }
    const account = await ctx.kysely
      .selectFrom("accounts")
      .where("blockchain_address", "=", address)
      .select(["id", "gas_gift_status"])
      .executeTakeFirstOrThrow();
    return account.gas_gift_status as keyof typeof GasGiftStatus;
  }),
});
