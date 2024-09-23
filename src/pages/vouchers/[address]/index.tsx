import { createServerSideHelpers } from "@trpc/react-query/server";
import {
  type GetStaticPaths,
  type GetStaticPropsContext,
  type InferGetStaticPropsType,
} from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Card } from "~/components/ui/card";
import { appRouter } from "~/server/api/root";
import { api } from "~/utils/api";
import { toUserUnitsString } from "~/utils/units";

import { type UTCTimestamp } from "lightweight-charts";
import { EditIcon } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useToken } from "wagmi";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import StatisticsCard from "~/components/cards/statistics-card";
import { LineChart } from "~/components/charts/line-chart";
import { ContractFunctions } from "~/components/contract/ContractFunctions";
import { Icons } from "~/components/icons";
import { ContentContainer } from "~/components/layout/content-container";
import { getVoucherDetails } from "~/components/pools/contract-functions";
import { useContractIndex, useSwapPool } from "~/components/pools/hooks";
import { ProductList } from "~/components/products/product-list";
import { TransactionsTable } from "~/components/tables/transactions-table";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import UpdateVoucherForm from "~/components/voucher/forms/update-voucher-form";
import {
  BasicVoucherFunctions,
  ManageVoucherFunctions,
} from "~/components/voucher/voucher-contract-functions";
import { VoucherHoldersTable } from "~/components/voucher/voucher-holders-table";
import { abi as DMRAbi } from "~/contracts/erc20-demurrage-token/contract";
import { abi as GiftableAbi } from "~/contracts/erc20-giftable-token/contract";
import { env } from "~/env";
import { Authorization } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useIsOwner } from "~/hooks/useIsOwner";
import { graphDB, indexerDB } from "~/server/db";
import SuperJson from "~/utils/trpc-transformer";
import { VoucherInfo } from "../../../components/voucher/voucher-info";

const LocationMap = dynamic(
  () => import("../../../components/map/location-map"),
  {
    ssr: false,
  }
);

const VoucherForceGraph = dynamic(
  () => import("~/components/force-graph").then((mod) => mod.VoucherForceGraph),
  {
    ssr: false,
  }
);
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
  const address = context.params?.address as `0x{string}`;
  // prefetch `post.byId`
  await helpers.voucher.byAddress.prefetch({
    voucherAddress: address,
  });
  const details = await getVoucherDetails(address);
  return {
    props: {
      trpcState: helpers.dehydrate(),
      address,
      details,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 10, // In seconds
  };
}
export const getStaticPaths: GetStaticPaths = async () => {
  const vouchers = await graphDB
    .selectFrom("vouchers")
    .select("voucher_address")
    .execute();
  return {
    paths: vouchers.map((v) => ({
      params: {
        address: v.voucher_address,
      },
    })),
    // https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-blocking
    fallback: "blocking",
  };
};
const from = new Date(new Date().setMonth(new Date().getMonth() - 1));
const to = new Date();

const VoucherPage = ({
  details,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const voucher_address = router.query.address as `0x${string}`;
  const { data: poolsRegistry } = useContractIndex(
    env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS
  );
  const isOwner = useIsOwner(voucher_address);
  const isMounted = useIsMounted();
  const { data: voucher } = api.voucher.byAddress.useQuery({
    voucherAddress: voucher_address,
  });
  const { data: token } = useToken({
    address: voucher_address,
    query: {
      staleTime: 2_000,
      enabled: !!voucher_address,
    },
  });
  const { data: txsPerDay } = api.stats.txsPerDay.useQuery({
    voucherAddress: voucher_address,
  });
  const { data: volumnPerDay } = api.stats.voucherVolumePerDay.useQuery({
    voucherAddress: voucher_address,
  });

  const { data: stats } = api.stats.voucherStats.useQuery({
    voucherAddress: voucher_address,
    dateRange: {
      from: from,
      to: to,
    },
  });

  const getAbiByVoucherType = (voucherType: string | undefined) => {
    if (voucherType === "GIFTABLE") {
      return GiftableAbi;
    } else if (voucherType === "DEMURRAGE") {
      return DMRAbi;
    }
    return undefined;
  };
  const getVoucherTypeName = (voucherType: string | undefined) => {
    if (voucherType === "GIFTABLE") {
      return "Giftable";
    } else if (voucherType === "DEMURRAGE") {
      return "Expiring";
    }
    return "Unknown";
  };
  const abi = getAbiByVoucherType(voucher?.voucher_type);

  return (
    <ContentContainer title={details?.name ?? "Voucher Details"}>
      <BreadcrumbResponsive
        items={[
          { label: "Home", href: "/" },
          { label: "Vouchers", href: "/vouchers" },
          { label: details?.name ?? "" },
        ]}
      />
      <Head>
        <title>{`${details?.name ?? ""}`}</title>
        <meta
          name="description"
          content={voucher?.voucher_description ?? ""}
          key="desc"
        />
        <meta property="og:title" content={`${details.name}`} />
        <meta
          property="og:description"
          content={voucher?.voucher_description ?? ""}
        />
      </Head>
      <div>
        <div className="max-w-screen-2xl mx-auto px-4 w-full">
          {voucher?.banner_url && (
            <div className="relative h-64 rounded-lg overflow-hidden mb-8">
              <Image
                src={voucher.banner_url}
                alt={details.name ?? ""}
                fill={true}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
          <div className="mb-8 mt-8 flex items-center gap-6">
            <Avatar className="size-24 shadow-lg">
              <AvatarImage src={voucher?.icon_url ?? "/apple-touch-icon.png"} />
              <AvatarFallback>
                {details.name?.substring(0, 2).toLocaleUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold text-primary">
                {details.name}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-xl text-secondary">{details.symbol}</p>
                {voucher?.voucher_type && (
                  <span className="px-2 py-1 text-sm font-semibold bg-secondary text-secondary-foreground rounded-full">
                    {getVoucherTypeName(voucher.voucher_type)}
                  </span>
                )}
              </div>
              {voucher?.voucher_value && voucher?.voucher_uoa && (
                <div className="mt-4 inline-block px-4 py-2 bg-secondary rounded-md">
                  <p className="text-sm font-semibold text-secondary-foreground">
                    1 HOUR = {voucher.voucher_value} {voucher.voucher_uoa} of
                    Products
                  </p>
                </div>
              )}
            </div>
          </div>
          <BasicVoucherFunctions
            voucher_address={voucher_address}
            voucher={voucher}
          />
        </div>
        <Tabs defaultValue="home" className="mt-8">
          <TabsList className="mb-6">
            <TabsTrigger value="home">Home</TabsTrigger>

            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="holders">Holders</TabsTrigger>
            <Authorization
              resource={"Contract"}
              action="UPDATE"
              isOwner={isOwner}
            >
              <TabsTrigger value="manage">Manage</TabsTrigger>
            </Authorization>
            <Authorization
              resource={"Vouchers"}
              action="UPDATE"
              isOwner={isOwner}
            >
              <TabsTrigger value="update">
                <EditIcon className="size-4 mr-2" />
                Update
              </TabsTrigger>
            </Authorization>
          </TabsList>
          <TabsContent value="manage">
            <ManageVoucherFunctions voucher_address={voucher_address} />
            {isMounted && abi && (
              <ContractFunctions abi={abi} address={voucher_address} />
            )}
          </TabsContent>
          <TabsContent value="home">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">
                      {voucher?.voucher_description}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="px-4 py-4">
                    <ProductList
                      isOwner={isOwner}
                      voucher_id={voucher?.id ?? 0}
                      voucherSymbol={details.symbol ?? ""}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Pool Memberships</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {poolsRegistry?.contractAddresses?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center space-y-2 text-gray-500 h-32">
                        <Icons.pools className="w-8 h-8" />
                        <p>No pool memberships</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {poolsRegistry?.contractAddresses?.map((address) => (
                          <VoucherPoolListItem
                            key={address}
                            poolAddress={address}
                            voucherAddress={voucher_address}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data">
            <div className="grid w-fill gap-2 md:gap-4 grid-cols-2 md:grid-cols-4 items-center">
              <StatisticsCard
                value={stats?.transactions.total.toString() || "0"}
                title="Transactions"
                Icon={Icons.hash}
                delta={stats?.transactions.delta || 0}
                isIncrease={(stats?.transactions.delta || 0) > 0}
              />
              <StatisticsCard
                value={stats?.accounts.total.toString() || "0"}
                title="Active Users"
                Icon={Icons.person}
                delta={stats?.accounts.delta || 0}
                isIncrease={(stats?.accounts.delta || 0) > 0}
              />
              <StatisticsCard
                value={
                  isMounted
                    ? toUserUnitsString(
                        token?.totalSupply.value,
                        details.decimals
                      )
                    : "0"
                }
                title="Total Supply"
                Icon={Icons.hash}
                delta={0}
                isIncrease={false}
              />
              <StatisticsCard
                value={toUserUnitsString(
                  stats?.volume.total || BigInt(0),
                  details.decimals
                )}
                title="Volume"
                Icon={Icons.hash}
                delta={parseFloat(
                  toUserUnitsString(
                    BigInt(stats?.volume.delta || 0),
                    details.decimals
                  )
                )}
                isIncrease={(stats?.volume.delta || 0) > 0}
              />
            </div>
            <div className="grid mt-4 gap-4 grid-cols-1 lg:grid-cols-2">
              <div className="col-span-1">
                <Card>
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-2xl">Information</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-6">
                    {voucher && <VoucherInfo token={token} voucher={voucher} />}
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="network" className="col-span-1">
                <TabsList>
                  <TabsTrigger value="network">Network</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="volume">Volume</TabsTrigger>
                  <TabsTrigger value="map">Map</TabsTrigger>
                </TabsList>
                <Card className="overflow-hidden mt-4">
                  <CardContent className="p-0">
                    <TabsContent value="transactions" className="mt-0">
                      <LineChart
                        data={
                          txsPerDay?.map((v) => ({
                            time: (new Date(v.x).getTime() /
                              1000) as UTCTimestamp,
                            value: parseInt(v.y.toString()),
                          })) || []
                        }
                      />
                    </TabsContent>
                    <TabsContent value="volume" className="mt-0">
                      <LineChart
                        data={
                          volumnPerDay?.map((v) => ({
                            time: (v.x.getTime() / 1000) as UTCTimestamp,
                            value: parseInt(toUserUnitsString(BigInt(v.y))),
                          })) || []
                        }
                      />
                    </TabsContent>
                    <TabsContent value="map" className="mt-0">
                      <LocationMap
                        style={{
                          height: "350px",
                          width: "100%",
                          zIndex: 1,
                        }}
                        value={
                          voucher?.geo
                            ? { lat: voucher.geo?.x, lng: voucher.geo?.y }
                            : undefined
                        }
                      />
                    </TabsContent>
                    <TabsContent value="network" className="mt-0">
                      <div style={{ height: "350px", width: "100%" }}>
                        <VoucherForceGraph voucherAddress={voucher_address} />
                      </div>
                    </TabsContent>
                  </CardContent>
                </Card>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-0">
            <TransactionsTable voucherAddress={voucher_address} />
          </TabsContent>

          <TabsContent value="holders" className="mt-0">
            <VoucherHoldersTable voucherAddress={voucher_address} />
          </TabsContent>

          <TabsContent value="update">
            {voucher && <UpdateVoucherForm voucher={voucher} />}
          </TabsContent>
        </Tabs>
      </div>
    </ContentContainer>
  );
};

export default VoucherPage;

function VoucherPoolListItem(props: {
  poolAddress: `0x${string}`;
  voucherAddress: `0x${string}`;
}) {
  const { data: pool } = useSwapPool(props.poolAddress);
  if (!pool?.vouchers?.includes(props.voucherAddress)) return null;
  const details = pool?.voucherDetails?.find(
    (d) => d.address === props.voucherAddress
  );
  return (
    <Link
      href={`/pools/${pool?.address}`}
      key={pool?.address}
      className="grid grid-cols-2 gap-2 items-center p-2 rounded-sm"
    >
      <h3>{pool?.name}</h3>
      <div className="col-span-1">
        <div className=" bg-slate-700 w-full rounded-full text-center relative overflow-hidden">
          <div
            style={{
              width: `${
                ((details?.poolBalance?.formattedNumber ?? 0) /
                  (details?.limitOf?.formattedNumber ?? 0)) *
                100
              }%`,
            }}
            className={`absolute top-0 left-0 h-full bg-secondary rounded-full`}
          />
          <span className="z-10 text-white relative">
            {parseInt(details?.poolBalance?.formatted ?? "0")}/
            {parseInt(details?.limitOf?.formatted ?? "0")}
          </span>
        </div>
      </div>
    </Link>
  );
}
