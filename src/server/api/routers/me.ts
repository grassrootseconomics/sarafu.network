import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
import { isAddress } from "viem";
import { getVoucherDetails } from "~/components/pools/contract-functions";
import { UserProfileFormSchema } from "~/components/users/forms/profile-form";
import { authenticatedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { GasGiftStatus, type AccountRoleType } from "~/server/enums";
import { sendGasRequestedEmbed } from "../../discord";

export const meRouter = createTRPCRouter({
  get: authenticatedProcedure.query(async ({ ctx }) => {
    const address = ctx.session?.user?.account.blockchain_address;
    if (!address)
      throw new TRPCError({ code: "BAD_REQUEST", message: "No user found" });
    const info = await ctx.graphDB
      .selectFrom("users")
      .innerJoin("accounts", "users.id", "accounts.user_identifier")
      .innerJoin(
        "personal_information",
        "users.id",
        "personal_information.user_identifier"
      )
      .where("accounts.blockchain_address", "=", address)
      .select([
        sql<keyof typeof AccountRoleType>`accounts.account_role`.as(
          "account_role"
        ),
        "personal_information.given_names",
        "personal_information.family_name",
        "personal_information.gender",
        "personal_information.year_of_birth",
        "personal_information.location_name",
        "personal_information.geo",
        "accounts.default_voucher",
      ])
      .executeTakeFirstOrThrow();
    const vpa = await ctx.graphDB
      .selectFrom("vpa")
      .innerJoin("accounts", "vpa.linked_account", "accounts.id")
      .where("accounts.blockchain_address", "=", address)
      .select("vpa")
      .executeTakeFirst();

    return { ...vpa, ...info };
  }),

  update: authenticatedProcedure
    .input(UserProfileFormSchema)
    .mutation(
      async ({
        ctx,
        input: { vpa, default_voucher, account_role: _account_role, ...pi },
      }) => {
        const address = ctx.session?.user?.account.blockchain_address;
        if (!address) throw new Error("No user found");
        const user = await ctx.graphDB
          .selectFrom("users")
          .innerJoin("accounts", "users.id", "accounts.user_identifier")
          .leftJoin("vpa", "accounts.id", "vpa.linked_account")
          .where("accounts.blockchain_address", "=", address)
          .select(["users.id as userId", "accounts.id as accountId", "vpa"])
          .executeTakeFirst();
        if (!user) throw new Error("No user found");
        await ctx.graphDB
          .updateTable("personal_information")
          .set({
            year_of_birth: pi.year_of_birth,
            family_name: pi.family_name,
            given_names: pi.given_names,
            location_name: pi.location_name,
            geo: pi.geo,
          })
          .where("user_identifier", "=", user.userId)
          .execute();
        if (vpa && user.vpa) {
          await ctx.graphDB
            .updateTable("vpa")
            .set({ vpa })
            .where("linked_account", "=", user.accountId)
            .execute();
        }

        if (user.accountId && default_voucher) {
          await ctx.graphDB
            .updateTable("accounts")
            .set({ default_voucher })
            .where("id", "=", user.accountId)
            .execute();
        }
        if (vpa && !user.vpa) {
          await ctx.graphDB
            .insertInto("vpa")
            .values({ vpa, linked_account: user.accountId })
            .execute();
        }
        return true;
      }
    ),
  vouchers: authenticatedProcedure.query(async ({ ctx }) => {
    const address = ctx.session?.user?.account.blockchain_address;
    if (!address || !isAddress(address)) {
      return [];
    }
    const vouchers = await ctx.indexerDB
      .selectFrom("token_transfer")
      .select("contract_address")
      .where((eb) =>
        eb.or([
          eb("sender_address", "=", address),
          eb("recipient_address", "=", address),
        ])
      )
      .distinct()
      .execute();
    const voucherAddresses = vouchers.map((v) => v.contract_address);
    const result = await ctx.graphDB
      .selectFrom("vouchers")
      .selectAll()
      .where("voucher_address", "in", voucherAddresses)
      .execute();
    // Add vouchers that are not in the result but in the vouchers array
    const resultSet = new Set(result.map((v) => v.voucher_address));
    for (const voucher of vouchers) {
      if (!resultSet.has(voucher.contract_address)) {
        const details = await getVoucherDetails(
          voucher.contract_address as `0x${string}`
        );
        result.push({
          voucher_address: voucher.contract_address as `0x${string}`,
          symbol: details.symbol ?? "Unknown",
          voucher_name: details.name ?? "Unknown",
        });
      }
    }
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
    const account = await ctx.graphDB
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

    await ctx.graphDB
      .updateTable("accounts")
      .set({ gas_gift_status: GasGiftStatus.REQUESTED })
      .where("id", "=", account.id)
      .execute();
    const user = await ctx.graphDB
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
      ])
      .executeTakeFirstOrThrow();
    const name = user.given_names + " " + user.family_name;
    await sendGasRequestedEmbed({
      address,
      name: name ?? "Unknown",
      ip: ctx.ip ?? "Unknown",
    });

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
    const account = await ctx.graphDB
      .selectFrom("accounts")
      .where("blockchain_address", "=", address)
      .select(["id", "gas_gift_status"])
      .executeTakeFirstOrThrow();
    return account.gas_gift_status as keyof typeof GasGiftStatus;
  }),
});
