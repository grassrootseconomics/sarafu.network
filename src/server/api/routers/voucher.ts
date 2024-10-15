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
import { VoucherModel } from "../models/voucher";

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
    const voucherModel = new VoucherModel(ctx);
    return voucherModel.listVouchers();
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

      const voucherModel = new VoucherModel(ctx);
      const transactionResult = await voucherModel.deleteVoucher(
        input.voucherAddress
      );

      await VoucherIndex.remove(input.voucherAddress);
      await sendVoucherEmbed(transactionResult, "Delete");

      return true;
    }),
  byAddress: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const voucherModel = new VoucherModel(ctx);
      const voucher = await voucherModel.findVoucherByAddress(
        input.voucherAddress
      );
      if (voucher) {
        const issuers = await voucherModel.getVoucherIssuers(voucher.id);
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
    .query(({ ctx, input }) => {
      const voucherModel = new VoucherModel(ctx);
      return voucherModel.getVoucherCommodities(input.voucher_id);
    }),
  holders: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const voucherModel = new VoucherModel(ctx);
      return voucherModel.getVoucherHolders(input.voucherAddress);
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
        const voucherModel = new VoucherModel(ctx);
        const voucher = await voucherModel.createVoucher({
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
        });

        await voucherModel.addVoucherIssuer(
          voucher.id,
          ctx.session.user.account_id
        );

        if (
          input.nameAndProducts?.products &&
          input.nameAndProducts.products.length >= 1
        ) {
          await Promise.all(
            input.nameAndProducts.products.map((product) =>
              voucherModel.addVoucherCommodity({
                commodity_name: product.name,
                commodity_description: product.description ?? "",
                commodity_type: CommodityType.GOOD,
                voucher: voucher.id,
                quantity: product.quantity,
                location_name: input.aboutYou.location ?? " ",
                frequency: product.frequency,
                account: ctx.session.user.account_id,
              })
            )
          );
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
      const voucherModel = new VoucherModel(ctx);
      return voucherModel.updateVoucher(input);
    }),
});
