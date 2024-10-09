import { TRPCError } from "@trpc/server";
import { isAddress } from "viem";
import { z } from "zod";
import { ethFaucet } from "~/contracts/eth-faucet";
import { router, staffProcedure } from "~/server/api/trpc";
import { GasGiftStatus } from "~/server/enums";

export const gasRouter = router({
  get: staffProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
      })
    )
    .query(async ({ ctx, input }) => {
      const account = await ctx.graphDB
        .selectFrom("accounts")
        .where("blockchain_address", "=", input.address)
        .select(["id", "gas_gift_status"])
        .executeTakeFirstOrThrow();
      const accountsRegistry = await ethFaucet.registry();
      const isRegistered = await accountsRegistry.isActive(input.address);
      if (account.gas_gift_status !== GasGiftStatus.APPROVED && isRegistered) {
        await accountsRegistry.remove(input.address);
      }
      return account.gas_gift_status as keyof typeof GasGiftStatus;
    }),
  approve: staffProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const approver_id = ctx.session.user.account_id;
      if (!approver_id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid approver",
        });
      }
      const account = await ctx.graphDB
        .selectFrom("accounts")
        .where("blockchain_address", "=", input.address)
        .select(["id", "gas_gift_status"])
        .executeTakeFirstOrThrow();

      const registry = await ethFaucet.registry();
      const isRegistered = await registry.isActive(input.address);
      await ctx.graphDB
        .updateTable("accounts")
        .set({
          gas_gift_status: GasGiftStatus.APPROVED,
          gas_approver: approver_id,
        })
        .where("id", "=", account.id)
        .execute();
      if (!isRegistered) {
        const transactionReceipt = await registry.add(input.address);
        if (transactionReceipt.status === "success") {
          await ethFaucet.giveTo(input.address);
          return {
            isRegistered: true,
            message: "Address registered successfully.",
          };
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to register address. TX # ${transactionReceipt.transactionHash}`,
          });
        }
      }
    }),
  reject: staffProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const approver_id = ctx.session?.user?.account_id;
      if (!approver_id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid approver",
        });
      }
      const account = await ctx.graphDB
        .selectFrom("accounts")
        .where("blockchain_address", "=", input.address)
        .select(["id", "gas_gift_status"])
        .executeTakeFirstOrThrow();

      const registry = await ethFaucet.registry();
      const isRegistered = await registry.isActive(input.address);
      if (isRegistered) {
        const transactionReceipt = await registry.remove(input.address);
        if (transactionReceipt.status === "reverted") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Removal of address was reverted # ${transactionReceipt.transactionHash}`,
          });
        }
      }
      await ctx.graphDB
        .updateTable("accounts")
        .set({
          gas_gift_status: GasGiftStatus.REJECTED,
          gas_approver: approver_id,
        })
        .where("id", "=", account.id)
        .execute();
      return true;
    }),
});
