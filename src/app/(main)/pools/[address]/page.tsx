import type { Metadata } from "next";
// import { Icons } from "~/components/icons";
import { getAddress } from "viem";
import {
  getContractIndex,
  getSwapPool,
} from "~/components/pools/contract-functions";
import { publicClient } from "~/config/viem.config.server";
import { env } from "~/env";
import { caller } from "~/server/api/routers/_app";
import { PoolClientPage } from "./pool-client-page";

export async function generateStaticParams() {
  const data = await getContractIndex(
    publicClient,
    env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS
  );
  return data.contractAddresses.map((address) => ({
    address: address,
  }));
}
type Props = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const pool_address = getAddress(params.address);

  const poolDetails = await getSwapPool(publicClient, pool_address);
  const poolData = await caller.pool.get(pool_address);

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

export default function PoolPage() {
  return <PoolClientPage />;
}
