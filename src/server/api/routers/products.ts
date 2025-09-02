import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
import { z } from "zod";
import {
  insertProductListingInput,
  updateProductListingInput,
} from "~/components/products/schema";
import { publicClient } from "~/config/viem.config.server";
import { getIsContractOwner } from "~/contracts/helpers";
import {
  authenticatedProcedure,
  publicProcedure,
  router,
} from "~/server/api/trpc";
import { type CommodityType } from "~/server/enums";
import { hasPermission } from "~/utils/permissions";

export const productsRouter = router({
  nearbyOffers: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const offers = await ctx.graphDB
        .selectFrom("product_listings")
        .leftJoin("vouchers", "product_listings.voucher", "vouchers.id")
        .leftJoin("accounts", "product_listings.account", "accounts.id")
        .where("product_listings.commodity_available", "=", true)
        .where("vouchers.active", "=", true)
        .where("product_listings.image_url", "is not", null)
        .where("product_listings.image_url", "!=", "")
        .distinctOn("product_listings.id")
        .select([
          "product_listings.id",
          "product_listings.commodity_name as title",
          "product_listings.commodity_description as description",
          "product_listings.image_url as image",
          "product_listings.location_name as provider",
          "product_listings.price",
          "product_listings.geo",
          "vouchers.voucher_name",
          "vouchers.symbol",
          "vouchers.voucher_address",
          "vouchers.icon_url",
          sql<number>`
            CASE 
              WHEN product_listings.created_at > NOW() - INTERVAL '7 days' THEN 1 
              ELSE 0 
            END
          `.as("trending"),
        ])
        .orderBy("product_listings.id")
        .orderBy("product_listings.created_at", "desc")
        .limit(input.limit)
        .execute();

      return offers.map((offer) => ({
        id: offer.id,
        title: offer.title,
        description: offer.description,
        provider: offer.provider || "Unknown Provider",
        distance: "0.5 km away", // TODO: Calculate actual distance from user location
        vouchers: [offer.voucher_name || offer.symbol],
        image: offer.image || "/placeholder-product.jpg",
        trending: Boolean(offer.trending),
        price: offer.price,
        voucher_address: offer.voucher_address,
        voucher_icon: offer.icon_url,
      }));
    }),
  list: publicProcedure
    .input(
      z.object({
        voucher_addresses: z.array(z.string()).optional(),
      })
    )
    .query(({ ctx, input }) => {
      let query = ctx.graphDB
        .selectFrom("product_listings")
        .leftJoin("vouchers", "product_listings.voucher", "vouchers.id")
        .orderBy("product_listings.commodity_name", "asc")
        .select([
          sql<`0x${string}`>`vouchers.voucher_address`.as("voucher_address"),
          "product_listings.id",
          "product_listings.commodity_name",
          "product_listings.commodity_description",
          sql<keyof typeof CommodityType>`product_listings.commodity_type`.as(
            "commodity_type"
          ),
          "product_listings.quantity",
          "product_listings.frequency",
          "product_listings.image_url",
          "product_listings.price",
        ]);
      if (input.voucher_addresses === undefined) {
        return query.execute();
      }
      if (input.voucher_addresses.length === 0) {
        return [];
      }
      query = query.where(
        "vouchers.voucher_address",
        "in",
        input.voucher_addresses
      );
      return query.execute();
    }),
  byId: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.graphDB
        .selectFrom("product_listings")
        .selectAll()
        .where("id", "=", input.id)
        .executeTakeFirst();
    }),
  insert: authenticatedProcedure
    .input(insertProductListingInput)
    .mutation(async ({ ctx, input }) => {
      const voucher = await ctx.graphDB
        .selectFrom("vouchers")
        .where("voucher_address", "=", input.voucher_address)
        .select("id")
        .executeTakeFirstOrThrow();

      const productListing = await ctx.graphDB
        .insertInto("product_listings")
        .values({
          commodity_name: input.commodity_name,
          commodity_description: input.commodity_description ?? "",
          commodity_type: input.commodity_type,
          quantity: input.quantity ?? 0,
          frequency: input.frequency ?? "",
          location_name: "",
          image_url: input.image_url ?? "",
          voucher: voucher.id,
          price: input.price,
          account: ctx.user.account_id,
        })
        .returningAll()
        .executeTakeFirst()
        .catch((error) => {
          console.error("Failed to insert product listing:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to insert product listing`,
            cause: error,
          });
        });
      return productListing;
    }),
  update: authenticatedProcedure
    .input(updateProductListingInput)
    .mutation(async ({ ctx, input }) => {
      const { voucher_address } = await ctx.graphDB
        .selectFrom("product_listings")
        .leftJoin("vouchers", "product_listings.voucher", "vouchers.id")
        .select("voucher_address")
        .where("product_listings.id", "=", input.id)
        .executeTakeFirstOrThrow();

      const isContractOwner = await getIsContractOwner(
        publicClient,
        ctx.session.address,
        voucher_address as `0x${string}`
      );
      if (!hasPermission(ctx.user, isContractOwner, "Products", "UPDATE")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to update this product listing",
        });
      }

      const updatedProductListing = await ctx.graphDB
        .updateTable("product_listings")
        .set({
          commodity_name: input.commodity_name,
          commodity_description: input.commodity_description ?? "",
          commodity_type: input.commodity_type,
          quantity: input.quantity ?? 0,
          frequency: input.frequency ?? "",
          image_url: input.image_url ?? "",
          price: input.price,
        })
        .where("id", "=", input.id)
        .returningAll()
        .executeTakeFirst()
        .catch((error) => {
          console.error("Failed to update product listing:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update product listing`,
            cause: error,
          });
        });
      return updatedProductListing;
    }),
  remove: authenticatedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const voucher = await ctx.graphDB
        .selectFrom("product_listings")
        .leftJoin("vouchers", "product_listings.voucher", "vouchers.id")
        .select("voucher_address")
        .where("product_listings.id", "=", input.id)
        .executeTakeFirstOrThrow();
      const voucher_address = voucher.voucher_address;
      const isContractOwner = await getIsContractOwner(
        publicClient,
        ctx.session.address,
        voucher_address as `0x${string}`
      );

      if (!hasPermission(ctx.user, isContractOwner, "Products", "DELETE")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this product listing",
        });
      }

      const transactionResult = await ctx.graphDB
        .transaction()
        .execute(async (trx) => {
          await trx
            .deleteFrom("product_listings")
            .where("id", "=", input.id)
            .executeTakeFirstOrThrow();
          return true;
        })
        .catch((error) => {
          console.error("Failed to remove product listing:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to remove product listing`,
            cause: error,
          });
        });

      return transactionResult;
    }),
});
