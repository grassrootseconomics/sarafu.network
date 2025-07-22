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
    <ContentContainer title={pool?.name ?? ""} className="bg-transparent">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        {/* Banner Background */}
        {poolData?.banner_url ? (
          <div className="absolute inset-0">
            <Image
              src={poolData.banner_url}
              alt="Pool banner"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
            {/* Animated Background Circles */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Large floating circles */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-2xl animate-pulse" />
              <div className="absolute top-1/3 -right-32 w-80 h-80 bg-indigo-300/10 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '6s' }} />
              <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-blue-300/8 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
              
              {/* Medium floating circles */}
              <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-white/6 rounded-full blur-lg animate-bounce" style={{ animationDuration: '8s', animationDelay: '1s' }} />
              <div className="absolute top-2/3 right-1/4 w-24 h-24 bg-indigo-200/12 rounded-full blur-md animate-pulse" style={{ animationDelay: '3s' }} />
              <div className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-blue-200/8 rounded-full blur-sm animate-bounce" style={{ animationDuration: '7s', animationDelay: '4s' }} />
              
              {/* Small accent circles */}
              <div className="absolute top-1/2 left-1/6 w-16 h-16 bg-white/4 rounded-full blur-sm animate-pulse" style={{ animationDelay: '5s' }} />
              <div className="absolute top-3/4 right-1/3 w-12 h-12 bg-indigo-100/10 rounded-full blur-xs animate-bounce" style={{ animationDuration: '9s' }} />
              <div className="absolute top-1/6 right-1/2 w-8 h-8 bg-blue-100/6 rounded-full animate-pulse" style={{ animationDelay: '6s' }} />
            </div>
          </div>
        )}
        
        {/* Content Overlay */}
        <div className="relative z-10 px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <div className="max-w-4xl">
            <div className="space-y-6">
              {/* Pool Name */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {pool?.name}
              </h1>
              
              {/* Tags */}
              {poolData?.tags && poolData.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <TagIcon className="h-5 w-5 text-white/80" />
                  <div className="flex flex-wrap gap-2">
                    {poolData.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-white/20 text-white border-white/20 hover:bg-white/30 transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Description */}
              {poolData?.swap_pool_description && (
                <p className="text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">
                  {poolData.swap_pool_description}
                </p>
              )}
              
              {/* Action Buttons */}
              <div className="pt-4">
                <PoolButtons pool={pool} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Modern Tabs Section */}
      <div className="mt-12">
        <Tabs defaultValue="reports" className="w-full">
          <div className="border-b border-gray-200 bg-white rounded-t-2xl">
            <TabsList className="w-full justify-start bg-transparent border-none rounded-none h-auto p-0">
              <TabsTrigger 
                value="reports" 
                className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent rounded-none hover:text-blue-600 transition-colors"
              >
                Reports
              </TabsTrigger>
              <TabsTrigger 
                value="vouchers" 
                className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent rounded-none hover:text-blue-600 transition-colors"
              >
                Vouchers
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent rounded-none hover:text-blue-600 transition-colors"
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger 
                value="info" 
                className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent rounded-none hover:text-blue-600 transition-colors"
              >
                Analytics
              </TabsTrigger>
              <Authorization resource={"Pools"} action="UPDATE" isOwner={isOwner}>
                <TabsTrigger 
                  value="edit" 
                  className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent rounded-none hover:text-blue-600 transition-colors"
                >
                  <PenIcon className="h-4 w-4 mr-2" />
                  Edit
                </TabsTrigger>
              </Authorization>
            </TabsList>
          </div>
          
          <div className="bg-white rounded-b-2xl shadow-lg">
            <TabsContent value="vouchers" className="p-0 m-0">
              <div className="p-6">
                <PoolVoucherTable pool={pool} />
              </div>
            </TabsContent>
            
            <TabsContent value="transactions" className="p-0 m-0">
              <div className="p-6">
                <PoolTransactionsTable pool={pool} />
              </div>
            </TabsContent>
            
            <TabsContent value="reports" className="p-0 m-0">
              <div className="p-6">
                <ReportList
                  query={{
                    vouchers: pool.vouchers,
                  }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="info" className="p-0 m-0">
              <div className="p-6 space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-900">Pool Analytics</h2>
                  <PoolDetails address={pool_address} />
                </div>
                <div>
                  <PoolAnalyticsWrapper pool={pool} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="edit" className="p-0 m-0">
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900">Edit Pool</h2>
                <UpdatePoolForm
                  address={pool_address}
                  poolDescription={poolData?.swap_pool_description}
                  bannerUrl={poolData?.banner_url}
                  poolTags={poolData?.tags}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ContentContainer>
  );
}
