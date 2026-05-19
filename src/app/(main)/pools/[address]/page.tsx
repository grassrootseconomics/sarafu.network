import type { Metadata } from "next";
import { getAddress } from "viem";
import {
  getCachedSwapPool,
  getPublicPoolMetadata,
} from "~/server/api/public-fetchers";
import { PoolClientPage } from "./pool-client-page";

export const revalidate = 60;

type Props = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const pool_address = getAddress(params.address);

  const [poolDetails, poolData] = await Promise.all([
    getCachedSwapPool(pool_address),
    getPublicPoolMetadata(pool_address),
  ]);

  return {
    title: poolDetails?.name,
    description: poolData?.swap_pool_description ?? "",
    openGraph: {
      title: poolDetails?.name,
      description: poolData?.swap_pool_description ?? "",
      url: `https://sarafu.network/pools/${pool_address}`,
      images: poolData?.banner_url ? [poolData.banner_url] : [],
    },
  };
}

export default async function PoolPage(props: {
  params: Promise<{ address: string }>;
}) {
  const params = await props.params;
  const pool_address = getAddress(params.address);

  const [initialPool, initialMetadata] = await Promise.all([
    getCachedSwapPool(pool_address),
    getPublicPoolMetadata(pool_address),
  ]);

  return (
    <PoolClientPage
      address={pool_address}
      initialPool={initialPool}
      initialMetadata={initialMetadata}
    />
  );
}
