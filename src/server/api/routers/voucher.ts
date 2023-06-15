import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
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
    return ctx.kysely.selectFrom("vouchers").selectAll().execute();
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
    const voucher = await opts.ctx.kysely
      .insertInto("vouchers")
      .values({
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
      })
      .returningAll()
      .executeTakeFirst();
    return voucher;
  }),
  registrationsPerDay: publicProcedure.query(async ({ ctx }) => {
    const start = new Date("2022-07-01");
    const end = new Date();
    const result = await sql<{ x: Date; y: bigint }>`
    WITH date_range AS (
      SELECT day::date
      FROM generate_series(${start}, ${end}, INTERVAL '1 day') day
    )
    SELECT
      date_range.day AS x,
      COUNT(users.id) AS y
    FROM
      date_range
      LEFT JOIN users ON date_range.day = CAST(users.date_registered AS date)
    GROUP BY
      date_range.day
    ORDER BY
      date_range.day;
  `.execute(ctx.kysely);
    console.log(result);
    return result.rows;
  }),
});
