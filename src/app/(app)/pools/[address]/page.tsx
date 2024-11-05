import { PenIcon, TagIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
// import { Icons } from "~/components/icons";
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
import { auth } from "~/server/api/auth";
import { caller } from "~/server/api/routers/_app";
import { PoolButtons } from "./pool-buttons-client";
import { PoolChartsWrapper } from "./pool-charts-client";
import { config } from "~/lib/web3";

export async function generateStaticParams() {
  const data = await getContractIndex(config, env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS);
  return data.contractAddresses.map((address) => ({
    address: address,
  }));
}

type Props = {
  params: { address: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const address = params.address;
  const poolDetails = await getSwapPool(config, address as `0x${string}`);
  const poolData = await caller.pool.get(address as `0x${string}`);

  return {
    title: poolDetails?.name,
    description: "",
    openGraph: {
      title: poolDetails?.name,
      description: poolData?.swap_pool_description ?? "",
      url: `https://sarafu.network/pools/${address}`,
      images: poolData?.banner_url ? [poolData.banner_url] : [],
    },
  };
}

export default async function PoolPage({ params }: Props) {
  const address = params.address as `0x${string}`;
  const session = await auth();
  const pool = await getSwapPool(config, address, session?.address);
  const poolData = await caller.pool.get(address);
  const isOwner = pool.owner === session?.address;
  return (
    <ContentContainer title={pool?.name ?? ""}>
      <BreadcrumbResponsive
        items={[
          { label: "Home", href: "/" },
          { label: "Pools", href: "/pools" },
          { label: pool?.name ?? "" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8 ">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="md:flex">
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
            <div className="p-8">
              <div className="flex items-center">
                {/* <Icons.pools className="h-8 w-8 text-primary mr-3" /> */}
                <h1 className="text-3xl font-bold text-gray-900">
                  {pool?.name}
                </h1>
              </div>
              {poolData?.tags && poolData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <TagIcon className="h-4 w-4 text-secondary flex-shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {poolData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-4 text-gray-600">
                {poolData?.swap_pool_description}
              </p>
              {/* Client Components for buttons */}
              <PoolButtons pool={pool} />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="vouchers" className="w-full">
            <TabsList className="flex justify-start mb-4">
              <TabsTrigger value="vouchers" className="px-4 py-2">
                Vouchers
              </TabsTrigger>
              <TabsTrigger value="transactions" className="px-4 py-2">
                Transactions
              </TabsTrigger>
              <TabsTrigger value="data" className="px-4 py-2">
                Data
              </TabsTrigger>
              <Authorization
                resource={"Pools"}
                action="UPDATE"
                isOwner={isOwner} // You'll need to handle this differently
              >
                <TabsTrigger value="edit" className="px-4 py-2">
                  <PenIcon className="h-4 w-4 mr-2" />
                  Edit
                </TabsTrigger>
              </Authorization>
              <TabsTrigger value="charts" className="px-4 py-2">
                Charts
              </TabsTrigger>
            </TabsList>
            <div className="bg-white shadow-md rounded-lg">
              <TabsContent value="vouchers" className="p-0">
                <PoolVoucherTable pool={pool} />
              </TabsContent>
              <TabsContent value="transactions" className="p-0">
                <PoolTransactionsTable pool={pool} />
              </TabsContent>
              <TabsContent value="data" className="p-6">
                <PoolDetails address={address} />
              </TabsContent>
              <TabsContent value="edit" className="p-6">
                <UpdatePoolForm
                  address={address}
                  poolDescription={poolData?.swap_pool_description}
                  bannerUrl={poolData?.banner_url}
                  poolTags={poolData?.tags}
                />
              </TabsContent>
              <TabsContent value="charts" className="p-6">
                <PoolChartsWrapper pool={pool} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </ContentContainer>
  );
}
