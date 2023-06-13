import { TRPCError } from "@trpc/server";
import { createPublicClient, createWalletClient, http, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { z } from "zod";
import { abi } from "~/contracts/erc20-token-index/contract";
import { env } from "~/env.mjs";
import { getViemChain } from "~/lib/web3";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

const insertVoucherCheck = z.object({
  voucher: z.object({
    demurrageRate: z.number(),
    periodMinutes: z.number(),
    // geo: z.string(), // "-1.286389, 36.817223"
    locationName: z.string(),
    sinkAddress: z
      .string()
      .refine(isAddress, { message: "Invalid address format" }),
    decimals: z.number(),
    supply: z.number(),
    symbol: z.string(),
    voucherAddress: z
      .string()
      .refine(isAddress, { message: "Invalid address format" }),
    voucherName: z.string(),
    voucherDescription: z.string(),
  }),
});
export type DeployVoucherInput = z.infer<typeof insertVoucherCheck>;
export const voucherRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.vouchers.findMany({
      take: 100,
    });
  }),
  deploy: adminProcedure.input(insertVoucherCheck).mutation(async (opts) => {
    // await opts.ctx.prisma.writeContract({
    const account = privateKeyToAccount(
      env.TOKEN_INDEX_WRITER_PRIVATE_KEY as `0x${string}`
    );
    const chain = getViemChain();
    const input = opts.input.voucher;
    // Initialize clients
    const client = createWalletClient({
      account,
      chain: chain,
      transport: http(),
    });
    const publicClient = createPublicClient({
      chain: chain,
      transport: http(),
    });

    // Write contract and get receipt
    console.log({
      address: env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS,
      functionName: "add",
      args: [input.voucherAddress],
    });
    try {
      const hash = await client.writeContract({
        abi: abi,
        address: env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS,
        functionName: "add",
        args: [input.voucherAddress],
      });
      console.log({ hash });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status == "reverted") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to write to Token Index: Transaction ${hash} on ${
            getViemChain().name
          } was Reverted`,
        });
      }
    } catch (error) {
      console.error(
        "Failed to write contract or get transaction receipt:",
        error
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to write to Token Index: Transaction`,
        cause: error,
      });
    }
    const voucher = await opts.ctx.prisma.vouchers.create({
      data: {
        active: true,
        // geo: input.geo,

        demurrage_rate: input.demurrageRate,
        location_name: input.locationName,
        sink_address: input.sinkAddress,
        supply: input.supply || 10,
        symbol: input.symbol,
        voucher_name: input.voucherName,
        voucher_description: input.voucherDescription,
        voucher_address: input.voucherAddress,
      },
    });
    return voucher;
  }),
});
