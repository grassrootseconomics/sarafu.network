import { TRPCError } from "@trpc/server";
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
import { hasPermission } from "~/utils/permissions";

export const productsRouter = router({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.graphDB.selectFrom("product_listings").selectAll().execute();
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
      const productListing = await ctx.graphDB
        .insertInto("product_listings")
        .values({
          commodity_name: input.commodity_name,
          commodity_description: input.commodity_description ?? "",
          commodity_type: input.commodity_type,
          quantity: input.quantity ?? 0,
          frequency: input.frequency ?? "",
          location_name: "",
          image_url: input.imageUrl ?? "",
          voucher: input.voucher_id,
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
          image_url: input.imageUrl ?? "",
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
