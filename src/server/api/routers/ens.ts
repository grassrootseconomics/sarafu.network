import { TRPCError } from "@trpc/server";
import { isAddress } from "viem";
import { z } from "zod";
import { resolveENS, updateENS } from "~/lib/sarafu/resolver";
import { authenticatedProcedure, router } from "~/server/api/trpc";

export const ensRouter = router({
  update: authenticatedProcedure
    .input(
      z.object({
        ens: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const address = ctx.session?.address;
      if (!address)
        throw new TRPCError({ code: "BAD_REQUEST", message: "No user found" });
      const ens = await updateENS(address, input.ens);
      return {
        message: "ENS updated successfully",
        data: ens,
      };
    }),

  get: authenticatedProcedure
    .input(
      z.union([
        z.object({ address: z.string().refine(isAddress) }),
        z.object({ ensName: z.string() }),
      ])
    )
    .query(async ({ input }) => {
      const ens = await resolveENS(input);
      return ens;
    }),
});
