import SafeApiKit from "@safe-global/api-kit";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env";
import { authenticatedProcedure, router } from "~/server/api/trpc";

// Schema for the signed Safe transaction data that comes from the client
const proposeTxInputSchema = z.object({
  safeAddress: z.string(),
  safeTransactionData: z.object({
    to: z.string(),
    value: z.string(),
    data: z.string(),
    operation: z.number(),
    safeTxGas: z.string(),
    baseGas: z.string(),
    gasPrice: z.string(),
    gasToken: z.string(),
    refundReceiver: z.string(),
    nonce: z.number(),
  }),
  safeTxHash: z.string(),
  senderSignature: z.string(),
  chainId: z.number(),
});

const getNonceSchema = z.object({
  safeAddress: z.string(),
  chainId: z.number(),
  nonce: z.number(),
});
export const safeRouter = router({
  /**
   * Proposes a Safe transaction to the Safe Transaction Service.
   * The transaction must already be signed on the client side.
   * This endpoint only handles the API service call with the secure API key.
   */
  proposeTx: authenticatedProcedure
    .input(proposeTxInputSchema)
    .mutation(async ({ input, ctx }) => {
      const sender = ctx.session.address;

      if (!sender) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User address not found in session",
        });
      }

      // Verify the Safe API token is configured on the server
      if (!env.SAFE_API_TOKEN) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Safe API token not configured on server",
        });
      }

      try {
        // Initialize Safe API Kit with the secure API key
        const safeService = new SafeApiKit({
          chainId: BigInt(input.chainId),
          apiKey: env.SAFE_API_TOKEN,
        });
        console.log("Initialized SafeApiKit for chainId:", input.chainId);
        // Propose the transaction to the Safe Transaction Service
        await safeService.proposeTransaction({
          safeAddress: input.safeAddress,
          safeTransactionData: input.safeTransactionData,
          safeTxHash: input.safeTxHash,
          senderAddress: sender,
          senderSignature: input.senderSignature,
          origin: "sarafu-network",
        });

        return {
          success: true,
          safeTxHash: input.safeTxHash,
        };
      } catch (error) {
        console.error("Error proposing Safe transaction:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to propose Safe transaction",
        });
      }
    }),
  getPendingNonce: authenticatedProcedure
    .input(getNonceSchema)
    .query(async ({ input }) => {
      let nonce: number = input.nonce;
      if (env.SAFE_API_TOKEN) {
        try {
          const safeService = new SafeApiKit({
            chainId: BigInt(input.chainId),
            apiKey: env.SAFE_API_TOKEN,
          });

          // Get pending transactions for this Safe
          const pendingTxs = await safeService.getPendingTransactions(
            input.safeAddress
          );

          if (pendingTxs.results && pendingTxs.results.length > 0) {
            // Find the highest nonce among pending transactions
            const highestPendingNonce = Math.max(
              ...pendingTxs.results.map((tx) => parseInt(tx.nonce))
            );

            // If there are pending transactions with nonce >= current on-chain nonce,
            // use the next available nonce
            if (highestPendingNonce >= nonce) {
              nonce = highestPendingNonce + 1;
              console.log(
                `Found pending transactions. Using nonce ${nonce} (highest pending: ${highestPendingNonce})`
              );
            }
          }
        } catch (error) {
          console.warn(
            "Could not fetch pending transactions from Safe service:",
            error
          );
        }
      }
      return { nonce };
    }),
});
