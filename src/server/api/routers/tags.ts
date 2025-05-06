import { z } from "zod";
import {
  authenticatedProcedure,
  publicProcedure,
  router,
} from "~/server/api/trpc";
import { TagModel } from "../models/tag";
import { hasPermission } from "~/utils/permissions";

export const tagsRouter = router({
  create: authenticatedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const canCreateTag = hasPermission(ctx.session?.user, false, "Tags", "CREATE");
      if (!canCreateTag) {
        throw new Error("You are not authorized to create tags");
      }
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
