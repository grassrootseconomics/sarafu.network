import { z } from "zod";
import {
  authenticatedProcedure,
  publicProcedure,
  router,
} from "~/server/api/trpc";
import { TagModel } from "../models/tag";

export const tagsRouter = router({
  create: authenticatedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tagModel = new TagModel(ctx.graphDB);
      const result = await tagModel.createTag(input.name);
      return result;
    }),
  list: publicProcedure.query(async ({ ctx }) => {
    const tagModel = new TagModel(ctx.graphDB);
    const tags = await tagModel.listTags();
    return tags;
  }),
});
