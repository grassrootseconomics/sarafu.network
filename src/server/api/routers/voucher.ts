import { TRPCError } from "@trpc/server";
import { getAddress, isAddress, parseUnits } from "viem";
import { z } from "zod";
import { deployVoucherInput } from "~/server/api/schemas/deploy-voucher";
import { publicClient } from "~/config/viem.config.server";
import { VoucherIndex } from "~/contracts";
import { getIsContractOwner } from "~/contracts/helpers";
import {
  deployDMR20,
  deployERC20,
  getContractAddressFromTxHash,
  OTXType,
  preCalculateContractAddress,
  trackOTX,
} from "~/lib/sarafu/custodial";
import {
  authenticatedProcedure,
  publicProcedure,
  router,
} from "~/server/api/trpc";
import { sendVoucherEmbed } from "~/server/discord";
import { AccountRoleType, CommodityType, VoucherType } from "~/server/enums";
import { cacheQuery } from "~/utils/cache/cacheQuery";
import { redis } from "~/utils/cache/kv";
import { getPermissions } from "~/utils/permissions";
import { getTokenDetails } from "../models/token";
import { getUniqueVoucherAddresses } from "../models/user";
import { VoucherModel, loadVouchers } from "../models/voucher";

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
  voucherUoa: z.string().optional(),
  voucherValue: z.coerce.number().min(0).optional(),
});
export type UpdateVoucherInput = z.infer<typeof updateVoucherInput>;

export type { DeployVoucherInput } from "~/server/api/schemas/deploy-voucher";

export type GeneratorYieldType = {
  message: string;
  status: "loading" | "success" | "error";
  address?: `0x${string}`;
  txHash?: `0x${string}`;
  error?: string;
};
export type DeploymentStatus = {
  step: number;
};
export const voucherRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          sortBy: z
            .enum(["transactions", "name", "created"])
            .default("transactions"),
          sortDirection: z.enum(["asc", "desc"]).default("desc"),
        })
        .optional(),
    )
    .query(({ ctx, input }) => {
      const voucherModel = new VoucherModel(ctx);
      return voucherModel.listVouchers(input);
    }),
  vouchersByAddress: publicProcedure
    .input(
      z.object({
        address: z
          .string()
          .refine(isAddress, { message: "Invalid address format" }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const voucherAddresses = await getUniqueVoucherAddresses(
        ctx,
        input.address,
      );
      if (!voucherAddresses.size) return [];
      return loadVouchers(ctx, voucherAddresses);
    }),
  // Number of vouchers
  count: publicProcedure.query(
    cacheQuery(3600, async ({ ctx }) => {
      const voucherModel = new VoucherModel(ctx);
      const data = await voucherModel.countVouchers();
      return data.count;
    }),
  ),
  remove: authenticatedProcedure
    .input(
      z.object({
        voucherAddress: z.string().refine(isAddress),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isContractOwner = await getIsContractOwner(
        publicClient,
        ctx.session.address,
        input.voucherAddress,
      );
      const canDelete = getPermissions(ctx.user, isContractOwner).Vouchers
        .DELETE;
      if (!canDelete) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to remove this voucher" });
      }

      const voucherModel = new VoucherModel(ctx);
      const transactionResult = await voucherModel.deleteVoucher(
        input.voucherAddress,
      );

      // Fire-and-forget: don't block the response on chain confirmation or Discord
      VoucherIndex.remove(input.voucherAddress).catch(console.error);
      sendVoucherEmbed(transactionResult, "Delete").catch(console.error);

      return true;
    }),
  pools: publicProcedure
    .input(z.object({ voucherAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const voucherModel = new VoucherModel(ctx);
      return voucherModel.getPools(input.voucherAddress);
    }),
  byAddress: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const voucherModel = new VoucherModel(ctx);
      const voucher = await voucherModel.findVoucherByAddress(
        input.voucherAddress,
      );
      return voucher ?? null;
    }),
  holders: publicProcedure
    .input(
      z.object({
        voucherAddress: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      const voucherModel = new VoucherModel(ctx);
      return voucherModel.getVoucherHolders(input.voucherAddress);
    }),
  deploy: authenticatedProcedure
    .input(deployVoucherInput)
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
          input.supply.toString(),
          6,
        );
        const userAddress = getAddress(ctx.session.address);
        const common = {
          name: input.name,
          decimals: 6,
          initialMintee: userAddress,
          initialSupply: initialSupply.toString(),
          owner: userAddress,
          symbol: input.symbol,
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

        yield {
          message: "Waiting for blockchain confirmation",
          status: "loading",
        };

        // Inline waitForDeployment with status updates
        let contractAddress: `0x${string}` | null = null;
        let txHash: `0x${string}` | null = null;
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts && !contractAddress) {
          await new Promise((resolve) => setTimeout(resolve, 4000));
          attempts++;

          if (attempts % 5 === 0) {
            yield {
              message: `Still waiting for confirmation (${
                attempts * 2
              }s elapsed)`,
              status: "loading",
            };
          }

          try {
            const trackingResponse = await trackOTX(
              deployResponse.result.trackingId,
            );
            const voucherTransaction = trackingResponse.result.otx.find(
              (tx) => tx.otxType === otxType && tx.status === "SUCCESS",
            );

            if (voucherTransaction) {
              // Pre-calculate address (instant, deterministic)
              const preCalculatedAddress = preCalculateContractAddress(
                voucherTransaction.signerAccount as `0x${string}`,
                voucherTransaction.nonce,
              );

              yield {
                message: "Contract deployed, preparing database entry",
                status: "loading",
              };

              // Optionally try quick RPC verification (non-blocking)
              const rpcAddress = await getContractAddressFromTxHash(
                publicClient,
                voucherTransaction.txHash,
              );

              // Use RPC address if available, otherwise use pre-calculated
              contractAddress = rpcAddress ?? preCalculatedAddress;
              txHash = voucherTransaction.txHash as `0x${string}`;

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
          symbol: input.symbol,
          voucher_name: input.name,
          voucher_address: voucherAddress,
          voucher_description: input.description,
          sink_address: communityFund,
          voucher_email: input.email,
          voucher_value: input.value,
          voucher_website: input.website,
          voucher_uoa: input.uoa,
          voucher_type: input.expiration.type,
          geo: input.geo,
          location_name: input.location ?? " ",
          internal: internal,
          contract_version: contractVersion,
        });

        await voucherModel.addVoucherIssuer(
          voucherAddress,
          ctx.session.user.account_id,
        );

        if (input.products && input.products.length >= 1) {
          await Promise.all(
            input.products.map((product) =>
              voucherModel.addVoucherCommodity({
                commodity_name: product.name,
                commodity_description: product.description ?? "",
                commodity_type: CommodityType.GOOD,
                voucher: voucher.id,
                quantity: product.quantity,
                image_url: product.image_url ?? "",
                location_name: input.location ?? " ",
                frequency: product.frequency,
                account: ctx.session.user.account_id,
              }),
            ),
          );
        }
        await ctx.graphDB
          .updateTable("accounts")
          .set({ default_voucher: voucherAddress })
          .where("id", "=", ctx.session.user.account_id)
          .execute();

        await redis.del(`auth:session:${ctx.session.address}`);

        yield {
          message: "Deployment Complete",
          address: voucherAddress,
          txHash: txHash ?? undefined,
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
        input.voucherAddress,
      );
      const canUpdate = getPermissions(ctx.user, isContractOwner).Vouchers
        .UPDATE;
      if (!canUpdate) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to update this voucher" });
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
        input.voucherAddress,
      );
      const canAdd = getPermissions(ctx.user, isContractOwner).Vouchers.ADD;
      if (!canAdd) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to add this voucher" });
      }
      const voucherDetails = await getTokenDetails(publicClient, {
        address: input.voucherAddress,
      });

      const voucherModel = new VoucherModel(ctx);
      if (!voucherDetails.symbol) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Voucher not found" });
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
