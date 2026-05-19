import { cache } from "react";
import { publicClient } from "~/config/viem.config.server";
import { getSwapPool } from "~/components/pools/contract-functions";
import { type SwapPool } from "~/components/pools/types";
import { federatedDB, graphDB } from "~/server/db";
import { cacheWithExpiry } from "~/utils/cache/cache";
import { PoolModel } from "./models/pool";
import { VoucherModel } from "./models/voucher";

const VOUCHER_TTL = 60;
const POOL_METADATA_TTL = 60;
const SWAP_POOL_TTL = 30;

export const getPublicVoucher = cache(async (address: string) => {
  return cacheWithExpiry(
    `public:voucher:${address.toLowerCase()}`,
    VOUCHER_TTL,
    () => {
      const voucherModel = new VoucherModel({ graphDB, federatedDB });
      return voucherModel
        .findVoucherByAddress(address)
        .then((v) => v ?? null);
    }
  );
});

export type PublicVoucher = Awaited<ReturnType<typeof getPublicVoucher>>;

export const getPublicPoolMetadata = cache(
  async (address: `0x${string}`) => {
    return cacheWithExpiry(
      `public:pool:${address.toLowerCase()}`,
      POOL_METADATA_TTL,
      () => {
        const poolModel = new PoolModel({ graphDB, federatedDB });
        return poolModel.get(address);
      }
    );
  }
);

export type PublicPoolMetadata = Awaited<
  ReturnType<typeof getPublicPoolMetadata>
>;

export const getCachedSwapPool = cache(
  async (address: `0x${string}`): Promise<SwapPool | undefined> => {
    try {
      return await cacheWithExpiry(
        `public:swap-pool:${address.toLowerCase()}`,
        SWAP_POOL_TTL,
        () => getSwapPool(publicClient, address)
      );
    } catch (error) {
      console.error("getCachedSwapPool failed", { address, error });
      return undefined;
    }
  }
);
