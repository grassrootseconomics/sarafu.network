import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env";
import { publicProcedure, router } from "../trpc";

const checkoutSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  poolAddress: z.string(),
  purpose: z.string().min(1),
  poolName: z.string(),
  amount: z.number().min(100), // Minimum 1 USD in cents
  estimate: z.boolean().optional(),
});

export const checkoutRouter = router({
  square: publicProcedure
    .input(checkoutSchema)
    .mutation(async ({ input }) => {
      try {
        // Create Square checkout via direct API call
        const url = new URL("/api/v1/checkout/square", env.SQUARE_API_URL);
        if (input.estimate) {
          url.searchParams.append("estimate", "true");
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.SQUARE_API_TOKEN}`,
          },
          body: JSON.stringify({
            name: input.name,
            email: input.email,
            poolAddress: input.poolAddress,
            purpose: input.purpose,
            poolName: input.poolName,
            amount: input.amount,
          }),
        });

        if (!response.ok) {
          throw new Error(`Square API error: ${response.statusText}`);
        }

        const data = (await response.json()) as {
          ok: boolean;
          result: {
            checkoutURL?: string;
            estimate: number;
            transactionId?: string;
          };
        };

        if (!data.ok) {
          throw new Error("Failed to create checkout link");
        }

        if (input.estimate) {
          return {
            ok: true,
            description: "Estimate calculated",
            result: {
              estimate: data.result.estimate,
            },
          };
        }

        if (!data.result.checkoutURL || !data.result.transactionId) {
          throw new Error("Missing checkout URL or transaction ID");
        }

        return {
          ok: true,
          description: "Checkout request successful",
          result: {
            checkoutURL: data.result.checkoutURL,
            estimate: data.result.estimate,
            transactionId: data.result.transactionId,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Checkout creation failed",
        });
      }
    }),
});
