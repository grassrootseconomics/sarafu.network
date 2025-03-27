import { env } from "~/env";
import { getCeloClient } from "~/lib/web3";
import { TokenIndex } from "./erc20-token-index";

// Only create the instances if the client is available
const client = getCeloClient();

export const PoolIndex = new TokenIndex(
  client,
  env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS
);

export const VoucherIndex = new TokenIndex(
  client,
  env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS
);
