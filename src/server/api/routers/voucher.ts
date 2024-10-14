import { TRPCError } from "@trpc/server";
import { getAddress, isAddress } from "viem";
import { z } from "zod";
import { schemas } from "~/components/voucher/forms/create-voucher-form/schemas";
import { VoucherIndex } from "~/contracts";
import { DMRToken } from "~/contracts/erc20-demurrage-token";
import * as dmrContract from "~/contracts/erc20-demurrage-token/contract";
import { GiftableToken } from "~/contracts/erc20-giftable-token";
import * as giftableContract from "~/contracts/erc20-giftable-token/contract";
import { getIsOwner } from "~/contracts/helpers";
import {
  authenticatedProcedure,
  publicProcedure,
  router,
} from "~/server/api/trpc";
import { publicClient } from "~/server/client";
import { sendVoucherEmbed } from "~/server/discord";
import { AccountRoleType, CommodityType } from "~/server/enums";
import { getPermissions } from "~/utils/permissions";

const insertVoucherInput = z.object(schemas);
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

export type GeneratorYieldType = {
  message: string;
  status: "loading" | "success" | "error";
  address?: `0x${string}`;
  error?: string;
};
export type DeploymentStatus = {
  step: number;
};
export const voucherRouter = router({
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
        ctx.session.address,
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
      return ctx.indexerDB
        .selectFrom("token_transfer")
        .leftJoin("tx", "tx.id", "token_transfer.tx_id")
        .distinctOn("recipient_address")
        .where("token_transfer.contract_address", "=", input.voucherAddress)
        .select(["recipient_address as address"])
        .execute();
    }),
  deploy: authenticatedProcedure
    .input(insertVoucherInput)
    .mutation(async function* ({
      ctx,
      input,
    }): AsyncGenerator<GeneratorYieldType> {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `You must be logged in to deploy a voucher`,
        });
      }
      if (!["gradual", "none"].includes(input.expiration.type)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Only gradual or none expiration is supported`,
        });
      }

      try {
        const userAddress = getAddress(ctx.session.address);
        yield { message: "Deploying your Token", status: "loading" };
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to deploy Token`,
        });
        let token;
        let communityFund = "";
        if (input.expiration.type === "gradual") {
          communityFund = input.expiration.communityFund;
          token = await DMRToken.deploy(publicClient, {
            name: input.nameAndProducts.name,
            symbol: input.nameAndProducts.symbol,
            expiration_rate: input.expiration.rate,
            expiration_period: input.expiration.period,
            sink_address: input.expiration.communityFund,
          });
        }
        if (input.expiration.type === "none") {
          token = await GiftableToken.deploy(publicClient, {
            name: input.nameAndProducts.name,
            symbol: input.nameAndProducts.symbol,
            expireTimestamp: BigInt(0),
          });
        }
        if (!token) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to deploy Token`,
          });
        }
        const contractVersion =
          input.expiration.type === "gradual"
            ? dmrContract.version
            : giftableContract.version;
        const type =
          input.expiration.type === "gradual"
            ? dmrContract.type
            : giftableContract.type;
        const voucherAddress = getAddress(token.address);

        yield {
          message: `Minting ${input.valueAndSupply.supply} ${input.nameAndProducts.symbol}`,
          status: "loading",
        };
        await token.mintTo(userAddress, input.valueAndSupply.supply);

        yield { message: "Transferring Ownership", status: "loading" };
        await token.transferOwnership(userAddress);

        yield { message: "Adding to Database", status: "loading" };

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
              voucher_type: type,
              geo: input.aboutYou.geo,
              location_name: input.aboutYou.location ?? " ",
              internal: internal,
              contract_version: contractVersion,
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
              backer: ctx.session.user.account_id,
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
                  account: ctx.session.user.account_id,
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
        yield {
          message: "Deployment Complete",
          address: voucherAddress,
          status: "success",
        };
        await sendVoucherEmbed(voucher, "Create");

        return voucher;
      } catch (error) {
        console.error("Failed to deploy Token", error);
        yield {
          message: "Deployment Failed",
          status: "error",
          error: (error as Error)?.message,
        };
      }
    }),
  update: authenticatedProcedure
    .input(updateVoucherInput)
    .mutation(async ({ ctx, input }) => {
      const isContractOwner = await getIsOwner(
        ctx.session.address,
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
