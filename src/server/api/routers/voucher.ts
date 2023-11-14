import { TRPCError } from "@trpc/server";
import { isAddress } from "viem";
import { z } from "zod";
import { schemas } from "~/components/voucher/forms/create-voucher-form/schemas";
import { TokenIndex } from "~/contracts/erc20-token-index";
import { env } from "~/env.mjs";
import {
  adminProcedure,
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
  staffProcedure,
} from "~/server/api/trpc";
import { AccountRoleType, CommodityType, VoucherType } from "~/server/enums";

const insertVoucherInput = z.object({
  ...schemas,
  voucherAddress: z
    .string()
    .refine(isAddress, { message: "Invalid address format" }),
  contractVersion: z.string(),
});
const updateVoucherInput = z.object({
  geo: z.object({
    x: z.number(),
    y: z.number(),
  }),
  locationName: z.string(),
  voucherAddress: z
    .string()
    .refine(isAddress, { message: "Invalid address format" }),
  voucherDescription: z.string(),
});
export type UpdateVoucherInput = z.infer<typeof updateVoucherInput>;

export type DeployVoucherInput = z.infer<typeof insertVoucherInput>;

const tokenIndex = new TokenIndex();

export const voucherRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }) => {
    return ctx.kysely.selectFrom("vouchers").selectAll().execute();
  }),
  remove: adminProcedure
    .input(
      z.object({
        voucherAddress: z.string().refine(isAddress),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const transactionResult = await ctx.kysely
        .transaction()
        .execute(async (trx) => {
          const { voucherAddress } = input;

          const { id, symbol } = await trx
            .selectFrom("vouchers")
            .where("voucher_address", "=", voucherAddress)
            .select(["id", "symbol"])
            .executeTakeFirstOrThrow();

          const address = await tokenIndex.addressOf(symbol);

          if (address !== voucherAddress) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Voucher Address (${voucherAddress}) does not match address (${address}) in the Token Index`,
            });
          }
          await trx
            .deleteFrom("transactions")
            .where("voucher_address", "=", voucherAddress)
            .executeTakeFirstOrThrow();

          await trx
            .deleteFrom("voucher_issuers")
            .where("voucher", "=", id)
            .executeTakeFirstOrThrow();
          await trx
            .deleteFrom("voucher_certifications")
            .where("voucher", "=", id)
            .executeTakeFirstOrThrow();
          await trx
            .deleteFrom("commodity_listings")
            .where("voucher", "=", id)
            .executeTakeFirstOrThrow();
          await trx
            .deleteFrom("vouchers")
            .where("id", "=", id)
            .executeTakeFirstOrThrow();

          await tokenIndex.remove(address);

          return true;
        });

      return transactionResult;
    }),
  byAddress: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const voucher = await ctx.kysely
        .selectFrom("vouchers")
        .select([
          "id",
          "voucher_address",
          "voucher_name",
          "voucher_description",
          "geo",
          "location_name",
          "sink_address",
          "symbol",
        ])
        .where("voucher_address", "=", input.voucherAddress)
        .executeTakeFirst();
      return voucher;
    }),
  holders: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.kysely
        .selectFrom("transactions")
        .innerJoin(
          "accounts",
          "transactions.recipient_address",
          "accounts.blockchain_address"
        )
        .distinctOn("transactions.recipient_address")
        .where("transactions.voucher_address", "=", input.voucherAddress)
        .select(["accounts.created_at", "blockchain_address as address"])
        .execute();
    }),
  deploy: authenticatedProcedure
    .input(insertVoucherInput)
    .mutation(async ({ ctx, input }) => {
      if (input.expiration.type !== "gradual") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Only gradual expiration is supported`,
        });
      }
      const communityFund = input.expiration.communityFund;
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `You must be logged in to deploy a voucher`,
        });
      }
      const internal = ctx.session.user.role === AccountRoleType.ADMIN;
      // Write contract and get receipt
      console.debug({
        address: env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS,
        functionName: "add",
        args: [input.voucherAddress],
      });

      const voucher = await ctx.kysely.transaction().execute(async (trx) => {
        // Create Voucher in DB
        const v = await trx
          .insertInto("vouchers")
          .values({
            symbol: input.nameAndProducts.symbol,
            voucher_name: input.nameAndProducts.name,
            voucher_address: input.voucherAddress,
            voucher_description: input.nameAndProducts.description,
            sink_address: communityFund,
            voucher_email: input.aboutYou.email,
            voucher_value: input.valueAndSupply.value,
            voucher_website: input.aboutYou.website,
            voucher_uoa: input.valueAndSupply.uoa,
            voucher_type: VoucherType.DEMURRAGE,
            geo: input.aboutYou.geo,
            location_name: input.aboutYou.location,
            internal: internal,
            contract_version: input.contractVersion,
          })
          .returningAll()
          .executeTakeFirst()
          .catch((error) => {
            console.error("Failed to insert voucher:", error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to add voucher to graph`,
              cause: error,
            });
          });
        if (!v || !v.id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to add voucher to graph`,
          });
        }
        // Add Issuer to DB
        await trx
          .insertInto("voucher_issuers")
          .values({
            voucher: v.id,
            backer: ctx.session!.user!.account.id,
          })
          .returningAll()
          .executeTakeFirst();

        // Add Products to DB
        // Add Products to DB
        if (input.nameAndProducts.products) {
          await trx
            .insertInto("commodity_listings")
            .values(
              input.nameAndProducts.products.map((product) => ({
                commodity_name: product.name,
                commodity_description: product.description,
                commodity_type: CommodityType.GOOD,
                voucher: v.id,
                quantity: product.quantity,
                location_name: input.aboutYou.location,
                frequency: product.frequency,
                account: ctx.session!.user!.account.id,
              }))
            )
            .returningAll()
            .execute();
        }
        // Add Voucher to Token Index Contract
        try {
          const receipt = await tokenIndex.add(input.voucherAddress);

          if (receipt.status == "reverted") {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Transaction Reverted`,
            });
          }
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to write to Token Index`,
            cause: error,
          });
        }
        return v;
      });

      return voucher;
    }),
  update: staffProcedure
    .input(updateVoucherInput)
    .mutation(async ({ ctx, input }) => {
      const voucher = await ctx.kysely
        .updateTable("vouchers")
        .set({
          geo: input.geo,
          location_name: input.locationName,
          voucher_description: input.voucherDescription,
        })
        .where("voucher_address", "=", input.voucherAddress)
        .returningAll()
        .executeTakeFirst()
        .catch((error) => {
          console.error("Failed to update voucher:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update voucher`,
            cause: error,
          });
        });
      return voucher;
    }),
});
