import { env } from "~/env";
import { publicClient } from "~/lib/web3";
import { TokenIndex } from "./erc20-token-index";

export const PoolIndex = new TokenIndex(
  publicClient,
  env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS
);

export const VoucherIndex = new TokenIndex(
  publicClient,
  env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS
);
