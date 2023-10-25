/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { sql } from "kysely";
import { isAddress } from "viem";
import { UserProfileFormSchema } from "~/components/forms/profile-form";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  registrationsPerDay: publicProcedure.query(async ({ ctx }) => {
    const start = new Date("2022-07-01");
    const end = new Date();

    const result = await sql`WITH date_range AS (
      SELECT day::date
      FROM generate_series(${start}, ${end}, INTERVAL '1 day') day
    )
    SELECT
      date_range.day AS x,
      COUNT(users.id) AS y
    FROM
      date_range
      LEFT JOIN users ON date_range.day = CAST(users.date_registered AS date)
    GROUP BY
      date_range.day
    ORDER BY
      date_range.day;`.execute(ctx.kysely);

    return result;
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
  me: authenticatedProcedure.query(async ({ ctx }) => {
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
    const info = await ctx.kysely
      .selectFrom("personal_information")
      .where("user_identifier", "=", userId)
      .select([
        "given_names",
        "family_name",
        "gender",
        "year_of_birth",
        "location_name",
      ])
      .executeTakeFirstOrThrow();
    return info;
  }),
  updateMe: authenticatedProcedure
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
});
