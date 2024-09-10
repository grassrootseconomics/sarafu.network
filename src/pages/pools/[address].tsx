import { AspectRatio } from "@radix-ui/react-aspect-ratio";
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
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { ConnectButton } from "~/components/buttons/connect-button";
import { Icons } from "~/components/icons";
import { ContentContainer } from "~/components/layout/content-container";
import { ResponsiveModal } from "~/components/modal";
import {
  getContractIndex,
  getSwapPool,
} from "~/components/pools/contract-functions";
import { DonateToPoolButton } from "~/components/pools/forms/donate-form";
import { SwapForm } from "~/components/pools/forms/swap-form";
import { UpdatePoolForm } from "~/components/pools/forms/update-pool-form";
import { WithdrawFromPoolButton } from "~/components/pools/forms/withdraw-form";
import { useSwapPool } from "~/components/pools/hooks";
import { PoolDetails } from "~/components/pools/pool-details";
import { PoolDepositsTable } from "~/components/pools/tables/pool-deposits-table";
import { PoolTransactionsTable } from "~/components/pools/tables/pool-transactions-table";
import { PoolVoucherTable } from "~/components/pools/tables/pool-voucher-table";
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
  return (
    <ContentContainer title={pool?.name ?? ""} Icon={Icons.pools}>
      <BreadcrumbResponsive
        items={[
          { label: "Home", href: "/" },
          { label: "Pools", href: "/pools" },
          { label: pool?.name ?? "" },
        ]}
      />
      <div className="mx-1 sm:mx-2 my-2">
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
        <div className="flex flex-col md:flex-row justify-start items-center gap-x-4 m-2">
          {poolData?.banner_url && (
            <div className="w-full md:max-w-[450px] min-w-[300px] grow rounded-lg overflow-hidden shadow-md">
              <AspectRatio ratio={16 / 9}>
                <Image
                  src={poolData?.banner_url}
                  alt="banner"
                  fill={true}
                  className="object-cover"
                />
              </AspectRatio>
            </div>
          )}
          <div className="flex flex-col items-start justify-center bg-white p-4 rounded-lg w-full md:w-auto">
            <div className="flex items-center justify-start mb-2">
              <Icons.pools className="h-10 w-10 mr-2" />
              <h1 className="text-3xl font-extrabold">{pool?.name}</h1>
            </div>
            <h2 className="flex items-center justify-start text-xl font-extrabold text-secondary mb-2">
              <TagIcon className="h-4 w-4 mr-2" />
              {poolData?.tags?.map((tag) => tag).join(", ")}
            </h2>
            <div className="flex flex-row gap-2 mb-2">
              {auth?.account ? (
                <>
                  <ResponsiveModal
                    title="Swap"
                    button={
                      <Button>
                        <RefreshCcw className="mr-2 h-5 w-5" />
                        Swap
                      </Button>
                    }
                  >
                    <SwapForm swapPool={pool} />
                  </ResponsiveModal>
                  {pool && <DonateToPoolButton pool={pool} />}
                  {isOwner && pool && (
                    <WithdrawFromPoolButton
                      pool={pool}
                      button={
                        <Button>
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
            <p className="text-left whitespace-pre-wrap">
              {poolData?.swap_pool_description}
            </p>
          </div>
        </div>
        <Tabs defaultValue="vouchers">
          <TabsList>
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <Authorization resource={"Pools"} action="UPDATE" isOwner={isOwner}>
              <TabsTrigger value="edit">
                <PenIcon className="h-4 w-4" />
              </TabsTrigger>
            </Authorization>
          </TabsList>
          <div className="mt-4">
            <TabsContent value="vouchers">
              <PoolVoucherTable isWriter={isOwner} pool={pool} />
            </TabsContent>
            <TabsContent value="transactions">
              <PoolTransactionsTable pool={pool} />
            </TabsContent>
            <TabsContent value="data">
              <div className="flex flex-col md:flex-row gap-2">
                <PoolDetails address={pool_address} />
              </div>
            </TabsContent>
            <TabsContent value="edit">
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
