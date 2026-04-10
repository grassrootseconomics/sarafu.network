import { TRPCError } from "@trpc/server";
import { isAddress } from "viem";
import { z } from "zod";
import {
  defaultReceiptOptions,
  publicClient,
} from "@sarafu/contracts/chain";
import { EthFaucet } from "@sarafu/contracts/abi/eth-faucet/index";
import { withWriterLock } from "@sarafu/contracts/writer";
import { env } from "../env";
import { router, staffProcedure } from "../trpc";
import { GasGiftStatus } from "@sarafu/core/enums";
import { redis } from "../cache/kv";

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
      const ethFaucet = new EthFaucet(publicClient);
      const accountsRegistry = await ethFaucet.registry();
      const isRegistered = await accountsRegistry.isActive(input.address);
      if (account.gas_gift_status !== GasGiftStatus.APPROVED && isRegistered) {
        const hash = await withWriterLock(() =>
          accountsRegistry.submitRemove(input.address)
        );
        await publicClient.waitForTransactionReceipt({
          hash,
          ...defaultReceiptOptions,
        });
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

      const response = await fetch(`${env.GAS_API_URL}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": env.GAS_API_KEY,
        },
        body: JSON.stringify({ address: input.address }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Gas approval API error: ${response.status} ${errorText}`,
        });
      }

      await ctx.graphDB
        .updateTable("accounts")
        .set({
          gas_gift_status: GasGiftStatus.APPROVED,
          gas_approver: approver_id,
        })
        .where("id", "=", account.id)
        .execute();
      await redis.del(`auth:session:${input.address}`);
      return {
        isRegistered: true,
        message: "Address approved successfully.",
      };
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

      const ethFaucet = new EthFaucet(publicClient);
      const registry = await ethFaucet.registry();
      const isRegistered = await registry.isActive(input.address);
      if (isRegistered) {
        const removeHash = await withWriterLock(() =>
          registry.submitRemove(input.address)
        );
        const transactionReceipt = await publicClient.waitForTransactionReceipt(
          { hash: removeHash, ...defaultReceiptOptions }
        );
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
      await redis.del(`auth:session:${input.address}`);
      return true;
    }),
});
