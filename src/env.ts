import { createEnv } from "@t3-oss/env-nextjs";
import { isAddress } from "viem";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    GRAPH_DB_URL: z.string().url(),
    FEDERATED_DB_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    NEXT_IRON_PASSWORD: z.string().min(1),
    WRITER_PRIVATE_KEY: z.string().min(1),
    SARAFU_CHECKOUT_API_TOKEN: z.string(),
    SARAFU_CHECKOUT_API_URL: z.string().url(),
    SARAFU_RESOLVER_API_URL: z.string().url(),
    SARAFU_RESOLVER_API_TOKEN: z.string(),
    SARAFU_CUSTODIAL_API_URL: z.string().url(),
    SARAFU_CUSTODIAL_API_TOKEN: z.string(),
    SAFE_API_TOKEN: z.string().optional(),
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
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // Database and environment settings
    GRAPH_DB_URL: process.env.GRAPH_DB_URL,
    FEDERATED_DB_URL: process.env.FEDERATED_DB_URL,

    NODE_ENV: process.env.NODE_ENV,

    // Session settings
    NEXT_IRON_PASSWORD: process.env.NEXT_IRON_PASSWORD,

    // Private keys for various operations
    WRITER_PRIVATE_KEY: process.env.WRITER_PRIVATE_KEY,
    SARAFU_CHECKOUT_API_TOKEN: process.env.SARAFU_CHECKOUT_API_TOKEN,
    SARAFU_CHECKOUT_API_URL: process.env.SARAFU_CHECKOUT_API_URL,
    SARAFU_RESOLVER_API_URL: process.env.SARAFU_RESOLVER_API_URL,
    SARAFU_RESOLVER_API_TOKEN: process.env.SARAFU_RESOLVER_API_TOKEN,
    SARAFU_CUSTODIAL_API_URL: process.env.SARAFU_CUSTODIAL_API_URL,
    SARAFU_CUSTODIAL_API_TOKEN: process.env.SARAFU_CUSTODIAL_API_TOKEN,
    
    // Safe API token
    SAFE_API_TOKEN: process.env.SAFE_API_TOKEN,

    // Public Ethereum addresses
    NEXT_PUBLIC_ETH_FAUCET_ADDRESS: process.env.NEXT_PUBLIC_ETH_FAUCET_ADDRESS,
    NEXT_PUBLIC_TOKEN_INDEX_ADDRESS:
      process.env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS,
    NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS:
      process.env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS,
    NEXT_PUBLIC_BALANCE_SCANNER_ADDRESS:
      process.env.NEXT_PUBLIC_BALANCE_SCANNER_ADDRESS,

  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
