import { createEnv } from "@t3-oss/env-nextjs";
import { isAddress } from "viem";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    INDEXER_DB_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    NEXT_IRON_PASSWORD: z.string().min(1),
    WRITER_PRIVATE_KEY: z.string().min(1),
    SQUARE_API_TOKEN: z.string(),
    SQUARE_API_URL: z.string().url(),
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
    NEXT_PUBLIC_BALANCE_SCANNER_ADDRESS: z.string().refine(isAddress, {
      message: "Invalid address format",
    }),
    NEXT_PUBLIC_LOG_ROCKET_APP_ID: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // Database and environment settings
    DATABASE_URL: process.env.DATABASE_URL,
    INDEXER_DB_URL: process.env.INDEXER_DB_URL,

    NODE_ENV: process.env.NODE_ENV,

    // Session settings
    NEXT_IRON_PASSWORD: process.env.NEXT_IRON_PASSWORD,

    // Private keys for various operations
    WRITER_PRIVATE_KEY: process.env.WRITER_PRIVATE_KEY,
    SQUARE_API_TOKEN: process.env.SQUARE_API_TOKEN,
    SQUARE_API_URL: process.env.SQUARE_API_URL,

    // Public Ethereum addresses
    NEXT_PUBLIC_ETH_FAUCET_ADDRESS: process.env.NEXT_PUBLIC_ETH_FAUCET_ADDRESS,
    NEXT_PUBLIC_TOKEN_INDEX_ADDRESS:
      process.env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS,
    NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS:
      process.env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS,
    NEXT_PUBLIC_LOG_ROCKET_APP_ID: process.env.NEXT_PUBLIC_LOG_ROCKET_APP_ID,
    NEXT_PUBLIC_BALANCE_SCANNER_ADDRESS:
      process.env.NEXT_PUBLIC_BALANCE_SCANNER_ADDRESS,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
