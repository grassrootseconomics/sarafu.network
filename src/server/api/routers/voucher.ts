import { TRPCError } from "@trpc/server";
import { getAddress, isAddress } from "viem";
import { z } from "zod";
import { schemas } from "~/components/voucher/forms/create-voucher-form/schemas";
import { VoucherIndex } from "~/contracts";
import { getIsOwner } from "~/contracts/helpers";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { sendVoucherEmbed } from "~/server/discord";
import { AccountRoleType, CommodityType, VoucherType } from "~/server/enums";
import { getPermissions } from "~/utils/permissions";

const insertVoucherInput = z.object({
  ...schemas,
  voucherAddress: z
    .string()
    .refine(isAddress, { message: "Invalid address format" }),
  contractVersion: z.string(),
});
const updateVoucherInput = z.object({
  geo: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .nullable(),
  bannerUrl: z.string().url().nullable().optional(),
  iconUrl: z.string().url().nullable().optional(),
  voucherEmail: z.string().email().nullable(),
  voucherWebsite: z.string().url().nullable(),
  locationName: z.string().nullable(),
  voucherAddress: z
    .string()
    .refine(isAddress, { message: "Invalid address format" }),
  voucherDescription: z.string(),
});
export type UpdateVoucherInput = z.infer<typeof updateVoucherInput>;

export type DeployVoucherInput = z.infer<typeof insertVoucherInput>;

export const voucherRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.graphDB.selectFrom("vouchers").selectAll().execute();
  }),
  remove: authenticatedProcedure
    .input(
      z.object({
        voucherAddress: z.string().refine(isAddress),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const isContractOwner = await getIsOwner(
        ctx.user.account.blockchain_address,
        input.voucherAddress
      );
      const canDelete = getPermissions(ctx.user, isContractOwner).Vouchers
        .DELETE;
      if (!canDelete) {
        throw new Error("You are not allowed to remove this voucher");
      }
      const transactionResult = await ctx.graphDB
        .transaction()
        .execute(async (trx) => {
          const voucherAddress = getAddress(input.voucherAddress);
          const { id, symbol, voucher_name, voucher_description } = await trx
            .selectFrom("vouchers")
            .where((eb) =>
              eb("voucher_address", "=", voucherAddress).or(
                "voucher_address",
                "=",
                input.voucherAddress
              )
            )
            .select(["id", "symbol", "voucher_name", "voucher_description"])
            .executeTakeFirstOrThrow();

          const address = await VoucherIndex.addressOf(symbol);

          if (address.toLowerCase() !== voucherAddress.toLowerCase()) {
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
            .deleteFrom("product_listings")
            .where("voucher", "=", id)
            .executeTakeFirstOrThrow();
          await trx
            .deleteFrom("vouchers")
            .where("id", "=", id)
            .executeTakeFirstOrThrow();

          await VoucherIndex.remove(address);
          await sendVoucherEmbed(
            {
              voucher_name: voucher_name,
              symbol: symbol,
              voucher_address: voucherAddress,
              voucher_description: voucher_description,
            },
            "Delete"
          );

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
      const voucher = await ctx.graphDB
        .selectFrom("vouchers")
        .select([
          "id",
          "voucher_address",
          "voucher_name",
          "voucher_description",
          "geo",
          "location_name",
          "voucher_email",
          "voucher_website",
          "voucher_type",
          "voucher_uoa",
          "banner_url",
          "icon_url",
          "created_at",
          "voucher_value",
          "sink_address",
          "symbol",
        ])
        .where("voucher_address", "=", input.voucherAddress)
        .executeTakeFirst();
      if (voucher) {
        const issuers = await ctx.graphDB
          .selectFrom("voucher_issuers")
          .select(["backer"])
          .where("voucher_issuers.voucher", "=", voucher?.id)
          .leftJoin(
            "personal_information",
            "backer",
            "personal_information.user_identifier"
          )
          .select(["given_names", "family_name"])
          .execute();
        return {
          ...voucher,
          issuers,
        };
      }
      return null;
    }),
  commodities: publicProcedure
    .input(
      z.object({
        voucher_id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      let voucher = ctx.graphDB
        .selectFrom("product_listings")
        .select([
          "id",
          "price",
          "commodity_name",
          "commodity_description",
          "commodity_type",
          "quantity",
          "product_listings.voucher as voucher_id",
          "frequency",
        ]);
      if ("voucher_id" in input) {
        voucher = voucher.where("voucher", "=", input.voucher_id);
      }
      return voucher.execute();
    }),
  holders: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.graphDB
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
      const voucherAddress = getAddress(input.voucherAddress);
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
      const internal = ctx.session.user.role !== AccountRoleType.USER;

      const voucher = await ctx.graphDB.transaction().execute(async (trx) => {
        // Create Voucher in DB
        const v = await trx
          .insertInto("vouchers")
          .values({
            symbol: input.nameAndProducts.symbol,
            voucher_name: input.nameAndProducts.name,
            voucher_address: voucherAddress,
            voucher_description: input.nameAndProducts.description,
            sink_address: communityFund,
            voucher_email: input.aboutYou.email,
            voucher_value: input.valueAndSupply.value,
            voucher_website: input.aboutYou.website,
            voucher_uoa: input.valueAndSupply.uoa,
            voucher_type: VoucherType.DEMURRAGE,
            geo: input.aboutYou.geo,
            location_name: input.aboutYou.location ?? " ",
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

        if (
          input.nameAndProducts?.products &&
          input.nameAndProducts.products.length >= 1
        ) {
          await trx
            .insertInto("product_listings")
            .values(
              input.nameAndProducts.products.map((product) => ({
                commodity_name: product.name,
                commodity_description: product.description ?? "",
                commodity_type: CommodityType.GOOD,
                voucher: v.id,
                quantity: product.quantity,
                location_name: input.aboutYou.location ?? " ",
                frequency: product.frequency,
                account: ctx.session!.user!.account.id,
              }))
            )
            .returningAll()
            .execute();
        }
        // Add Voucher to Token Index Contract
        try {
          const success = await VoucherIndex.add(voucherAddress);

          if (!success) {
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
      await sendVoucherEmbed(voucher, "Create");

      return voucher;
    }),
  update: authenticatedProcedure
    .input(updateVoucherInput)
    .mutation(async ({ ctx, input }) => {
      const isContractOwner = await getIsOwner(
        ctx.user.account.blockchain_address,
        input.voucherAddress
      );
      const canUpdate = getPermissions(ctx.user, isContractOwner).Vouchers
        .UPDATE;
      if (!canUpdate) {
        throw new Error("You are not allowed to update this voucher");
      }
      const voucher = await ctx.graphDB
        .updateTable("vouchers")
        .set({
          geo: input.geo,
          location_name: input.locationName ?? " ",
          voucher_description: input.voucherDescription,
          voucher_email: input.voucherEmail,
          banner_url: input.bannerUrl,
          icon_url: input.iconUrl,
          voucher_website: input.voucherWebsite,
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
