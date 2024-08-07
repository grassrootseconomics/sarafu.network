import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  insertProductListingInput,
  updateProductListingInput,
} from "~/components/products/schema";
import {
  adminProcedure,
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { isAdmin, isStaff } from "../auth";

export const productsRouter = createTRPCRouter({
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
          quantity: input.quantity,
          frequency: input.frequency ?? "",
          location_name: "",
          voucher: input.voucher_id,
          price: input.price,
          account: ctx.user.account.id,
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
  update: adminProcedure
    .input(updateProductListingInput)
    .mutation(async ({ ctx, input }) => {
      const productListing = await ctx.graphDB
        .updateTable("product_listings")
        .set({
          commodity_name: input.commodity_name,
          commodity_description: input.commodity_description ?? "",
          commodity_type: input.commodity_type,
          quantity: input.quantity,
          frequency: input.frequency ?? "",
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
      return productListing;
    }),
  remove: authenticatedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const productListing = await ctx.graphDB
        .selectFrom("product_listings")
        .select("account")
        .where("id", "=", input.id)
        .executeTakeFirstOrThrow();
      if (
        productListing.account !== ctx.user.account.id ||
        !(isStaff(ctx.user) || isAdmin(ctx.user))
      ) {
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
