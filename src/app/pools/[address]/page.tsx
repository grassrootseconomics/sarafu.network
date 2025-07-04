import { PenIcon, TagIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
// import { Icons } from "~/components/icons";
import { getAddress } from "viem";
import { ContentContainer } from "~/components/layout/content-container";
import {
  getContractIndex,
  getSwapPool,
} from "~/components/pools/contract-functions";
import { UpdatePoolForm } from "~/components/pools/forms/update-pool-form";
import { PoolDetails } from "~/components/pools/pool-details";
import { PoolTransactionsTable } from "~/components/pools/tables/pool-transactions-table";
import { PoolVoucherTable } from "~/components/pools/tables/pool-voucher-table";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { env } from "~/env";
import { Authorization } from "~/hooks/useAuth";

import { ReportList } from "~/components/reports/report-list";
import { publicClient } from "~/config/viem.config.server";
import { auth } from "~/server/api/auth";
import { caller } from "~/server/api/routers/_app";
import { PoolAnalyticsWrapper } from "./pool-analytics-client";
import { PoolButtons } from "./pool-buttons-client";

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

export default async function PoolPage(props: Props) {
  const params = await props.params;
  const pool_address = getAddress(params.address);
  const session = await auth();
  const pool = await getSwapPool(publicClient, pool_address, session?.address);
  const poolData = await caller.pool.get(pool_address);
  const isOwner = pool.owner === session?.address;
  return (
    <ContentContainer title={pool?.name ?? ""}>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {poolData?.banner_url && (
            <div className="md:flex-shrink-0">
              <Image
                src={poolData.banner_url}
                alt="Pool banner"
                width={300}
                height={200}
                className="h-48 w-full object-cover md:h-full md:w-48"
              />
            </div>
          )}
          <div className="p-4 sm:p-8">
            <div className="flex items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
                {pool?.name}
              </h1>
            </div>
            {poolData?.tags && poolData.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TagIcon className="h-4 w-4 text-secondary flex-shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {poolData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-4 text-gray-600 break-words">
              {poolData?.swap_pool_description}
            </p>
            <PoolButtons pool={pool} />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="mx-auto max-w-full">
            <TabsTrigger value="reports" className="px-4 py-2">
              Reports
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="px-4 py-2">
              Vouchers
            </TabsTrigger>
            <TabsTrigger value="transactions" className="px-4 py-2">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="info" className="px-4 py-2">
              Info
            </TabsTrigger>
            <Authorization resource={"Pools"} action="UPDATE" isOwner={isOwner}>
              <TabsTrigger value="edit" className="px-4 py-2">
                <PenIcon className="h-4 w-4 mr-2" />
                Edit
              </TabsTrigger>
            </Authorization>
          </TabsList>
          <div className="bg-white rounded-lg">
            <TabsContent value="vouchers" className="p-0">
              <PoolVoucherTable pool={pool} />
            </TabsContent>
            <TabsContent value="transactions" className="p-0">
              <PoolTransactionsTable pool={pool} />
            </TabsContent>
            <TabsContent value="reports" className="p-0">
              <ReportList
                query={{
                  vouchers: pool.vouchers,
                }}
              />
            </TabsContent>
            <TabsContent value="info" className="p-0">
              <div className="space-y-8 mt-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Pool Details</h2>
                  <PoolDetails address={pool_address} />
                </div>
                <div>
                  <PoolAnalyticsWrapper pool={pool} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="edit" className="p-6">
              <UpdatePoolForm
                address={pool_address}
                poolDescription={poolData?.swap_pool_description}
                bannerUrl={poolData?.banner_url}
                poolTags={poolData?.tags}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ContentContainer>
  );
}
