import { z } from "zod";

const schema = z.object({
  WRITER_PRIVATE_KEY: z.string().min(1),
  KV_REST_API_URL: z.string().url(),
  KV_REST_API_TOKEN: z.string().min(1),
  SARAFU_RESOLVER_API_URL: z.string().url(),
  SARAFU_RESOLVER_API_TOKEN: z.string(),
  SARAFU_CUSTODIAL_API_URL: z.string().url(),
  SARAFU_CUSTODIAL_API_TOKEN: z.string(),
  NEXT_PUBLIC_TOKEN_INDEX_ADDRESS: z.string().min(1),
  NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS: z.string().min(1),
  NEXT_PUBLIC_ETH_FAUCET_ADDRESS: z.string().min(1),
});

function loadEnv() {
  if (process.env.SKIP_ENV_VALIDATION) {
    return process.env as unknown as z.infer<typeof schema>;
  }
  return schema.parse(process.env);
}

export const env = loadEnv();
