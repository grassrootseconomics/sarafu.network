import { isAddress } from "viem";
import { z } from "zod";
import { UserProfileFormSchema } from "~/components/users/schemas";
import {
  authenticatedProcedure,
  router,
  staffProcedure,
} from "~/server/api/trpc";
import { AccountRoleType, GasGiftStatus, InterfaceType } from "~/server/enums";
import { hasPermission } from "~/utils/permissions";
import { isPhoneNumber, normalizePhoneNumber } from "~/utils/phone-number";

export const userRouter = router({
  get: staffProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.graphDB
        .selectFrom("users")
        .innerJoin("accounts", "users.id", "accounts.user_identifier")
        .where("accounts.blockchain_address", "=", input.address)
        .select([
          "users.id as userId",
          "accounts.id as accountId",
          "default_voucher",
          "account_role as role",
        ])
        .executeTakeFirst();
      if (!user) throw new Error("No user found");
      const info = await ctx.graphDB
        .selectFrom("personal_information")
        .where("user_identifier", "=", user.userId)
        .select([
          "given_names",
          "family_name",
          "gender",
          "year_of_birth",
          "location_name",
          "geo",
        ])
        .executeTakeFirstOrThrow();
      const vpa = await ctx.graphDB
        .selectFrom("vpa")
        .where("linked_account", "=", user.accountId)
        .select("vpa")
        .executeTakeFirst();
      return {
        ...vpa,
        ...info,
        default_voucher: user.default_voucher,
        role: user.role as keyof typeof AccountRoleType,
      };
    }),
  update: staffProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress),
        data: UserProfileFormSchema,
      })
    )
    .mutation(
      async ({
        ctx,
        input: {
          data: { vpa: _vpa, default_voucher, role, ...pi },
          address,
        },
      }) => {
        const user = await ctx.graphDB
          .selectFrom("users")
          .innerJoin("accounts", "users.id", "accounts.user_identifier")
          .where("accounts.blockchain_address", "=", address)
          .select(["users.id as userId", "accounts.id as accountId"])
          .executeTakeFirst();
        if (!user) throw new Error("No user found");
        await ctx.graphDB
          .updateTable("personal_information")
          .set(pi)
          .where("user_identifier", "=", user.userId)
          .execute();
        if (
          role &&
          hasPermission(ctx.session?.user, false, "Users", "UPDATE_ROLE")
        ) {
          await ctx.graphDB
            .updateTable("accounts")
            .set({ account_role: role })
            .where("id", "=", user.accountId)
            .execute();
        }
        await ctx.graphDB
          .updateTable("accounts")
          .set({ default_voucher: default_voucher })
          .where("id", "=", user.accountId)
          .execute();
        return true;
      }
    ),
  list: staffProcedure
    .input(
      z.object({
        search: z.string().nullish(),
        interfaceType: z.array(z.nativeEnum(InterfaceType)).nullish(),
        gasGiftStatus: z.array(z.nativeEnum(GasGiftStatus)).nullish(),
        roles: z.array(z.nativeEnum(AccountRoleType)).nullish(),
        limit: z.number().min(1).nullish(),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor ?? 0;
      let query = ctx.graphDB
        .selectFrom("users")
        .innerJoin("accounts", "users.id", "accounts.user_identifier")
        .innerJoin(
          "personal_information",
          "users.id",
          "personal_information.user_identifier"
        )
        .leftJoin("vpa", "vpa.linked_account", "accounts.id")
        .selectAll()
        .limit(limit)
        .offset(cursor)
        .orderBy("users.id", "desc");
      if (input?.search) {
        query = query.where((eb) =>
          eb.or([
            eb("users.interface_identifier", "like", `%${input.search}%`),
            eb("accounts.blockchain_address", "like", `%${input.search}%`),
            eb("vpa.vpa", "like", `%${input.search}%`),
          ])
        );
      }
      if (input?.roles && input.roles.length > 0) {
        query = query.where("accounts.account_role", "in", input.roles);
      }
      if (input?.gasGiftStatus && input.gasGiftStatus.length > 0) {
        query = query.where(
          "accounts.gas_gift_status",
          "in",
          input.gasGiftStatus
        );
      }
      if (input?.interfaceType && input.interfaceType.length > 0) {
        query = query.where("users.interface_type", "in", input.interfaceType);
      }

      const users = await query.execute();
      return {
        users,
        nextCursor: users.length == limit ? cursor + limit : undefined,
      };
    }),
  getAddressBySearchTerm: authenticatedProcedure
    .input(
      z.object({
        searchTerm: z.string().trim(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if is phonenumber
      if (isPhoneNumber(input.searchTerm)) {
        const phoneNumber = normalizePhoneNumber(input.searchTerm);
        const result = await ctx.graphDB
          .selectFrom("users")
          .innerJoin("accounts as a", "a.user_identifier", "users.id")
          .innerJoin(
            "personal_information as pi",
            "pi.user_identifier",
            "users.id"
          )
          .where("interface_identifier", "=", phoneNumber)
          .where("interface_type", "=", "USSD")
          .select(["blockchain_address"])
          .executeTakeFirst();
        return result ?? null;
      }
      // Search VPA for and account with the vpa
      const result = await ctx.graphDB
        .selectFrom("accounts")
        .innerJoin("vpa", "vpa.linked_account", "accounts.id")
        .where("vpa.vpa", "=", input.searchTerm)
        .select(["blockchain_address"])
        .executeTakeFirst();
      return result ?? null;
    }),
});
