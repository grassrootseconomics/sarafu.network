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
    const info = await ctx.kysely
      .selectFrom("users")
      .innerJoin("accounts", "users.id", "accounts.user_identifier")
      .innerJoin(
        "personal_information",
        "users.id",
        "personal_information.user_identifier"
      )
      .where("accounts.blockchain_address", "=", address)
      .select([
        "personal_information.given_names",
        "personal_information.family_name",
        "personal_information.gender",
        "personal_information.year_of_birth",
        "personal_information.location_name",
        "personal_information.geo",
      ])
      .executeTakeFirstOrThrow();
    const vpa = await ctx.kysely
      .selectFrom("vpa")
      .innerJoin("accounts", "vpa.linked_account", "accounts.id")
      .where("accounts.blockchain_address", "=", address)
      .select("vpa")
      .executeTakeFirst();
    return { ...vpa, ...info };
  }),

  update: authenticatedProcedure
    .input(UserProfileFormSchema)
    .mutation(async ({ ctx, input: { vpa, ...pi } }) => {
      const address = ctx.session?.user?.account.blockchain_address;
      if (!address) throw new Error("No user found");
      const user = await ctx.kysely
        .selectFrom("users")
        .innerJoin("accounts", "users.id", "accounts.user_identifier")
        .leftJoin("vpa", "accounts.id", "vpa.linked_account")
        .where("accounts.blockchain_address", "=", address)
        .select(["users.id as userId", "accounts.id as accountId", "vpa"])
        .executeTakeFirst();
      if (!user) throw new Error("No user found");
      await ctx.kysely
        .updateTable("personal_information")
        .set(pi)
        .where("user_identifier", "=", user.userId)
        .execute();
      if (vpa && user.vpa) {
        await ctx.kysely
          .updateTable("vpa")
          .set({ vpa })
          .where("linked_account", "=", user.accountId)
          .execute();
      }
      if (vpa && !user.vpa) {
        await ctx.kysely
          .insertInto("vpa")
          .values({ vpa, linked_account: user.accountId })
          .execute();
      }
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
