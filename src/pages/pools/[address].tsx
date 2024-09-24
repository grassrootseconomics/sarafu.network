import { createServerSideHelpers } from "@trpc/react-query/server";
import { PenIcon, RefreshCcw, TagIcon } from "lucide-react";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { ConnectButton } from "~/components/buttons/connect-button";
import { DatePickerWithRange } from "~/components/date-picker";
import { Icons } from "~/components/icons";
import { ContentContainer } from "~/components/layout/content-container";
import { ResponsiveModal } from "~/components/modal";
import {
  getContractIndex,
  getSwapPool,
} from "~/components/pools/contract-functions";
import { DonateToPoolButton } from "~/components/pools/forms/donate-form";
import { PoolFeesDialog } from "~/components/pools/forms/fees-form";
import { SwapForm } from "~/components/pools/forms/swap-form";
import { UpdatePoolForm } from "~/components/pools/forms/update-pool-form";
import { WithdrawFromPoolButton } from "~/components/pools/forms/withdraw-form";
import { useSwapPool } from "~/components/pools/hooks";
import { PoolCharts } from "~/components/pools/pool-charts";
import { PoolDetails } from "~/components/pools/pool-details";
import { PoolTransactionsTable } from "~/components/pools/tables/pool-transactions-table";
import { PoolVoucherTable } from "~/components/pools/tables/pool-voucher-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { env } from "~/env";
import { Authorization, useAuth } from "~/hooks/useAuth";
import { appRouter } from "~/server/api/root";
import { graphDB, indexerDB } from "~/server/db";
import { api } from "~/utils/api";
import SuperJson from "~/utils/trpc-transformer";

export async function getStaticProps(
  context: GetStaticPropsContext<{ address: string }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      graphDB: graphDB,
      indexerDB: indexerDB,
      session: undefined,
      ip: "ssr",
    },
    transformer: SuperJson, // optional - adds superjson serialization
  });
  const address = context.params?.address;
  // prefetch `post.byId`
  await helpers.pool.get.prefetch(address as `0x${string}`);
  const pool = await getSwapPool(address as `0x${string}`);
  return {
    props: {
      pool: SuperJson.stringify(pool),
      trpcState: helpers.dehydrate(),
      address: address,
    },
    revalidate: 60 * 60 * 24, // In seconds
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const data = await getContractIndex(env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS);
  return {
    paths: data.contractAddresses.map((address) => ({
      params: {
        address: address,
      },
    })),
    fallback: "blocking",
  };
};

export default function PoolPage(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const router = useRouter();
  const pool_address = router.query.address as `0x${string}`;
  const { data: pool } = useSwapPool(pool_address, SuperJson.parse(props.pool));
  const auth = useAuth();
  const { data: poolData } = api.pool.get.useQuery(pool_address);
  const isOwner = Boolean(
    auth?.user?.account &&
      pool?.owner &&
      pool?.owner === auth?.user?.account.blockchain_address
  );

  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  return (
    <ContentContainer title={pool?.name ?? ""} Icon={Icons.pools}>
      <Head>
        <title>{`${pool?.name}`}</title>
        <meta
          name="description"
          content={poolData?.swap_pool_description}
          key="desc"
        />
        <meta property="og:title" content={`${pool?.name}`} />
        <meta
          property="og:url"
          content={`https://sarafu.network/pools/${pool?.address}`}
        />
        {poolData?.banner_url && (
          <meta property="og:image" content={poolData.banner_url} />
        )}
        <meta
          property="og:description"
          content={poolData?.swap_pool_description}
        />
      </Head>

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
                <Icons.pools className="h-8 w-8 text-primary mr-3" />
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
              <div className="mt-6 flex flex-wrap gap-3">
                {auth?.account ? (
                  <>
                    <ResponsiveModal
                      title="Swap"
                      button={
                        <Button
                          disabled={Number(pool?.tokenIndex.entryCount) === 0}
                        >
                          <RefreshCcw className="mr-2 h-5 w-5" />
                          Swap
                        </Button>
                      }
                    >
                      <SwapForm swapPool={pool} />
                    </ResponsiveModal>
                    {pool && <DonateToPoolButton pool={pool} />}
                    {isOwner && pool && <PoolFeesDialog pool={pool} />}
                    {isOwner && pool && (
                      <WithdrawFromPoolButton
                        pool={pool}
                        button={
                          <Button variant="outline">
                            <RefreshCcw className="mr-2 h-5 w-5" />
                            Withdraw
                          </Button>
                        }
                      />
                    )}
                  </>
                ) : (
                  <ConnectButton />
                )}
              </div>
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
                isOwner={isOwner}
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
                <PoolVoucherTable isWriter={isOwner} pool={pool} />
              </TabsContent>
              <TabsContent value="transactions" className="p-0">
                <PoolTransactionsTable pool={pool} />
              </TabsContent>
              <TabsContent value="data" className="p-6">
                <PoolDetails address={pool_address} />
              </TabsContent>
              <TabsContent value="edit" className="p-6">
                <UpdatePoolForm
                  address={pool_address}
                  poolDescription={poolData?.swap_pool_description}
                  bannerUrl={poolData?.banner_url}
                  poolTags={poolData?.tags}
                />
              </TabsContent>
              <TabsContent value="charts" className="p-6">
                <div className="mb-4">
                  <DatePickerWithRange
                    value={dateRange}
                    onChange={(newRange) => setDateRange(newRange)}
                  />
                </div>
                <PoolCharts pool={pool} dateRange={dateRange} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </ContentContainer>
  );
}
