import { z } from "zod";

const schema = z.object({
  GRAPH_DB_URL: z.string().url(),
  FEDERATED_DB_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXT_IRON_PASSWORD: z.string().min(1),
  GAS_API_URL: z.string().url(),
  GAS_API_KEY: z.string().min(1),
  KV_REST_API_URL: z.string().url(),
  KV_REST_API_TOKEN: z.string().min(1),
  KV_REST_API_READ_ONLY_TOKEN: z.string().min(1),
  SARAFU_CHECKOUT_API_URL: z.string().url(),
  SARAFU_CHECKOUT_API_TOKEN: z.string(),
  SAFE_API_TOKEN: z.string().optional(),
});

const result = (() => {
  if (process.env.SKIP_ENV_VALIDATION) {
    return {} as z.infer<typeof schema>;
  }
  return schema.parse(process.env);
})();

export const env = result;
