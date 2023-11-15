import { isAddress } from "viem";
import { z } from "zod";
import { UserProfileFormSchema } from "~/components/users/forms/profile-form";
import { createTRPCRouter, staffProcedure } from "~/server/api/trpc";
import { GasGiftStatus, InterfaceType } from "~/server/enums";

export const userRouter = createTRPCRouter({
  get: staffProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress),
      })
    )
    .query(async ({ ctx, input }) => {
      const userCheck = await ctx.kysely
        .selectFrom("users")
        .innerJoin("accounts", "users.id", "accounts.user_identifier")
        .where("accounts.blockchain_address", "=", input.address)
        .select("users.id")
        .executeTakeFirst();
      if (!userCheck) throw new Error("No user found");
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
  update: staffProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress),
        data: UserProfileFormSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userCheck = await ctx.kysely
        .selectFrom("users")
        .innerJoin("accounts", "users.id", "accounts.user_identifier")
        .where("accounts.blockchain_address", "=", input.address)
        .select("users.id")
        .executeTakeFirst();
      if (!userCheck) throw new Error("No user found");
      const userId = userCheck.id;
      await ctx.kysely
        .updateTable("personal_information")
        .set(input.data)
        .where("user_identifier", "=", userId)
        .execute();
      return true;
    }),
  list: staffProcedure
    .input(
      z.object({
        search: z.string().nullish(),
        interfaceType: z.array(z.nativeEnum(InterfaceType)).nullish(),
        gasGiftStatus: z.array(z.nativeEnum(GasGiftStatus)).nullish(),
        limit: z.number().min(1).nullish(),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor ?? 0;
      let query = ctx.kysely
        .selectFrom("users")
        .innerJoin("accounts", "users.id", "accounts.user_identifier")
        .innerJoin(
          "personal_information",
          "users.id",
          "personal_information.user_identifier"
        )
        .selectAll()
        .limit(limit)
        .offset(cursor)
        .orderBy("users.id", "desc");
      if (input?.search) {
        query = query.where((eb) =>
          eb.or([
            eb("users.interface_identifier", "like", `%${input.search}%`),
            eb("accounts.blockchain_address", "like", `%${input.search}%`),
          ])
        );
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
});
