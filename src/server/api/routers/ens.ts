import { TRPCError } from "@trpc/server";
import { isAddress } from "viem";
import { z } from "zod";
import {
  getAddressFromENS,
  getENSFromAddress,
  registerENS,
  updateENS,
} from "~/lib/sarafu/resolver";
import { authenticatedProcedure, router } from "~/server/api/trpc";

export const ensRouter = router({
  exists: authenticatedProcedure
    .input(z.object({ ensName: z.string().min(1, "ENS name cannot be empty") }))
    .query(async ({ input }) => {
      const address = await getAddressFromENS({ ensName: input.ensName });
      return !!address;
    }),
  register: authenticatedProcedure
    .input(
      z.object({
        hint: z.string().min(1, "ENS hint cannot be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const address = ctx.session?.address;
      if (!address) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No authenticated user found",
        });
      }

      try {
        const ens = await registerENS(address, input.hint);
        return {
          message: "ENS registered successfully",
          data: ens,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to update ENS",
        });
      }
    }),
  update: authenticatedProcedure
    .input(
      z.object({
        ensName: z.string().min(1, "ENS name cannot be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const address = ctx.session?.address;
      if (!address) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No authenticated user found",
        });
      }

      try {
        const result = await updateENS(input.ensName, address);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to update ENS",
        });
      }
    }),
  getENS: authenticatedProcedure
    .input(
      z
        .object({
          address: z.string().refine(isAddress, "Invalid Ethereum address"),
        })
        .strict()
    )
    .query(async ({ input }) => {
      try {
        const result = await getENSFromAddress(input);
        return result;
      } catch (error) {
        console.error(error);
        return null;
      }
    }),
  getAddress: authenticatedProcedure
    .input(
      z
        .object({
          ensName: z.string().min(1, "ENS name cannot be empty"),
        })
        .strict()
    )
    .query(async ({ input }) => {
      try {
        const result = await getAddressFromENS(input);
        return result;
      } catch (error) {
        console.error(error);
        return null;
      }
    }),
});
