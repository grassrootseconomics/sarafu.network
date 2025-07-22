import { TRPCError } from "@trpc/server";
import { getAddress, isAddress, parseUnits } from "viem";
import { z } from "zod";
import { getVoucherDetails } from "~/components/pools/contract-functions";
import { schemas } from "~/components/voucher/forms/create-voucher-form/schemas";
import { publicClient } from "~/config/viem.config.server";
import { VoucherIndex } from "~/contracts";
import { getIsContractOwner } from "~/contracts/helpers";
import {
  deployDMR20,
  deployERC20,
  OTXType,
  trackOTX,
  getContractAddressFromTxHash,
} from "~/lib/sarafu/custodial";
import {
  authenticatedProcedure,
  publicProcedure,
  router,
} from "~/server/api/trpc";
import { sendVoucherEmbed } from "~/server/discord";
import { AccountRoleType, CommodityType, VoucherType } from "~/server/enums";
import { getPermissions } from "~/utils/permissions";
import { VoucherModel } from "../models/voucher";

const insertVoucherInput = z.object(schemas);
const updateVoucherInput = z.object({
  geo: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .nullable()
    .optional(),
  bannerUrl: z.string().url().nullable().optional(),
  iconUrl: z.string().url().nullable().optional(),
  voucherEmail: z.string().email().nullable().optional(),
  voucherWebsite: z.string().url().nullable().optional(),
  locationName: z.string().nullable().optional(),
  voucherAddress: z
    .string()
    .refine(isAddress, { message: "Invalid address format" }),
  voucherDescription: z.string().optional(),
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
  list: publicProcedure
    .input(
      z.object({
        sortBy: z.enum(["transactions", "name", "created"]).default("transactions"),
        sortDirection: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(({ ctx, input }) => {
      const voucherModel = new VoucherModel(ctx);
      return voucherModel.listVouchers({
        sortBy: input.sortBy,
        sortDirection: input.sortDirection,
      });
    }),
  // Number of vouchers
  count: publicProcedure.query(async ({ ctx }) => {
    const voucherModel = new VoucherModel(ctx);
    const data = await voucherModel.countVouchers();
    return data.count;
  }),
  remove: authenticatedProcedure
    .input(
      z.object({
        voucherAddress: z.string().refine(isAddress),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const isContractOwner = await getIsContractOwner(
        publicClient,
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
      return voucher ?? null;
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
      try {
        const initialSupply = parseUnits(
          input.valueAndSupply.supply.toString(),
          6
        );
        const userAddress = getAddress(ctx.session.address);
        const common = {
          name: input.nameAndProducts.name,
          decimals: 6,
          initialMintee: userAddress,
          initialSupply: initialSupply.toString(),
          owner: userAddress,
          symbol: input.nameAndProducts.symbol,
        };
        yield { message: "Deploying your Token", status: "loading" };
        let communityFund = "";
        let deployResponse;
        let otxType: OTXType;
        
        if (input.expiration.type === VoucherType.DEMURRAGE) {
          communityFund = input.expiration.communityFund;
          deployResponse = await deployDMR20({
            ...common,
            demurrageRate: input.expiration.rate.toString(),
            demurragePeriod: input.expiration.period.toString(),
            sinkAddress: communityFund,
          });
          otxType = OTXType.DEMURRAGE_TOKEN_DEPLOY;
        } else if (input.expiration.type === VoucherType.GIFTABLE) {
          deployResponse = await deployERC20({
            ...common,
          });
          otxType = OTXType.STANDARD_TOKEN_DEPLOY;
        } else if (input.expiration.type === VoucherType.GIFTABLE_EXPIRING) {
          deployResponse = await deployERC20({
            ...common,
            expiryTimestamp: (
              input.expiration.expirationDate.getTime() / 1000
            ).toString(),
          });
          otxType = OTXType.EXPIRING_TOKEN_DEPLOY;
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid voucher type",
          });
        }

        yield { message: "Waiting for blockchain confirmation", status: "loading" };
        
        // Inline waitForDeployment with status updates
        let contractAddress: `0x${string}` | null = null;
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts && !contractAddress) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          attempts++;

          if (attempts % 5 === 0) {
            yield { 
              message: `Still waiting for confirmation (${attempts * 2}s elapsed)`, 
              status: "loading" 
            };
          }

          try {
            const trackingResponse = await trackOTX(deployResponse.result.trackingId);
            const voucherTransaction = trackingResponse.result.otx.find(
              (tx) => tx.otxType === otxType && tx.status === "SUCCESS"
            );

            if (voucherTransaction) {
              contractAddress = await getContractAddressFromTxHash(
                publicClient,
                voucherTransaction.txHash
              );
              break;
            }
          } catch (error) {
            console.error("Error tracking OTX:", error);
          }
        }

        if (!contractAddress) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get contract address after deployment",
          });
        }
        
        const voucherAddress = contractAddress;
        const contractVersion = "CUSTODIAL";
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
          voucher_type: input.expiration.type,
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
                image_url: "",
                location_name: input.aboutYou.location ?? " ",
                frequency: product.frequency,
                account: ctx.session.user.account_id,
              })
            )
          );
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
      const isContractOwner = await getIsContractOwner(
        publicClient,
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

  add: authenticatedProcedure
    .input(updateVoucherInput)
    .mutation(async ({ ctx, input }) => {
      const isContractOwner = await getIsContractOwner(
        publicClient,
        ctx.session.address,
        input.voucherAddress
      );
      const canAdd = getPermissions(ctx.user, isContractOwner).Vouchers.ADD;
      if (!canAdd) {
        throw new Error("You are not allowed to add this voucher");
      }
      const voucherDetails = await getVoucherDetails(
        publicClient,
        input.voucherAddress
      );

      const voucherModel = new VoucherModel(ctx);
      if (!voucherDetails.symbol) {
        throw new Error("Voucher not found");
      }
      const data = {
        symbol: voucherDetails.symbol,
        voucher_name: voucherDetails.name ?? "",
        voucher_address: input.voucherAddress,
        sink_address: "",
        voucher_website: input.voucherWebsite ?? "",
        voucher_email: input.voucherEmail ?? "",
        voucher_description: input.voucherDescription ?? "",
        voucher_value: 0,
        voucher_uoa: "",
        voucher_type: "UNKNOWN",
        location_name: input.locationName ?? "",
        internal: false,
        contract_version: "",
        geo: input.geo ?? undefined,
      };
      return voucherModel.createVoucher(data);
    }),
});
