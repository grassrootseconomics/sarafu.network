import { publicClient } from "./chain";
import { env } from "./env";
import { TokenIndex } from "./abi/erc20-token-index";

export const PoolIndex = new TokenIndex(
  publicClient,
  env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS as `0x${string}`
);

export const VoucherIndex = new TokenIndex(
  publicClient,
  env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS as `0x${string}`
);
