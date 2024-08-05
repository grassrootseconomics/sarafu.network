import { createEnv } from "@t3-oss/env-nextjs";
import { isAddress } from "viem";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    WRITER_PRIVATE_KEY: z.string().min(1),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_TOKEN_INDEX_ADDRESS: z
      .string()
      .refine(isAddress, { message: "Invalid address format" }),
    NEXT_PUBLIC_ETH_FAUCET_ADDRESS: z.string().refine(isAddress, {
      message: "Invalid address format",
    }),
    NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS: z.string().refine(isAddress, {
      message: "Invalid address format",
    }),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // Private keys for various operations
    WRITER_PRIVATE_KEY: process.env.WRITER_PRIVATE_KEY,

    // Public Ethereum addresses
    NEXT_PUBLIC_ETH_FAUCET_ADDRESS: process.env.NEXT_PUBLIC_ETH_FAUCET_ADDRESS,
    NEXT_PUBLIC_TOKEN_INDEX_ADDRESS:
      process.env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS,
    NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS:
      process.env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation:
    !!process.env.CI ||
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
});
