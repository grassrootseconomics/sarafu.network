import { z } from "zod";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";

export const tagsRouter = createTRPCRouter({
  create: authenticatedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.graphDB
        .insertInto("tags")
        .values({
          tag: input.name,
        })
        .execute();
    }),
  list: publicProcedure.query(async ({ ctx }) => {
    const tags = await ctx.graphDB
      .selectFrom("tags")
      .selectAll()
      .execute();
    return tags;
  }),
});
