import { createServerSideHelpers } from "@trpc/react-query/server";
import { type UTCTimestamp } from "lightweight-charts";
import { type GetStaticPaths, type GetStaticPropsContext } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { LineChart } from "~/components/charts/line-chart";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { appRouter } from "~/server/api/root";
import { api } from "~/utils/api";
import { toUserUnits, toUserUnitsString } from "~/utils/units";

import {
  AtSignIcon,
  EditIcon,
  GlobeIcon,
  MapPinIcon,
  UserIcon,
} from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useToken } from "wagmi";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import StatisticsCard from "~/components/cards/statistics-card";
import { Icons } from "~/components/icons";
import { ContentContainer } from "~/components/layout/content-container";
import { useContractIndex, useSwapPool } from "~/components/pools/hooks";
import { ProductList } from "~/components/products/product-list";
import { TransactionsTable } from "~/components/tables/transactions-table";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import UpdateVoucherForm from "~/components/voucher/forms/update-voucher-form";
import { VoucherContractFunctions } from "~/components/voucher/voucher-contract-functions";
import { VoucherHoldersTable } from "~/components/voucher/voucher-holders-table";
import { env } from "~/env";
import { useAuth } from "~/hooks/useAuth";
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
    },
    transformer: SuperJson, // optional - adds superjson serialization
  });
  const address = context.params?.address as string;
  // prefetch `post.byId`
  await helpers.voucher.byAddress.prefetch({
    voucherAddress: address,
  });
  return {
    props: {
      trpcState: helpers.dehydrate(),
      address,
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

const VoucherPage = () => {
  const router = useRouter();
  const voucher_address = router.query.address as `0x${string}`;
  const auth = useAuth();
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
  const canEdit = Boolean(auth && (auth.isAdmin || auth.isStaff || isOwner));
  if (!voucher) return <div>Voucher not Found</div>;
  return (
    <ContentContainer title={voucher.voucher_name}>
      <BreadcrumbResponsive
        items={[
          {
            label: "Home",
            href: "/",
          },
          { label: "Vouchers", href: "/vouchers" },
          { label: voucher.voucher_name },
        ]}
      />
      <Head>
        <title>{`${voucher.voucher_name}`}</title>
        <meta
          name="description"
          content={voucher.voucher_description}
          key="desc"
        />
        <meta property="og:title" content={`${voucher.voucher_name}`} />
        <meta property="og:description" content={voucher.voucher_description} />
      </Head>
      <div className="max-w-screen-2xl mx-auto px-4 w-full">
        <div className="mb-4 mt-8 flex justify-start items-center ">
          <Avatar className="size-20 mr-4 shadow-md">
            <AvatarImage src={voucher.icon_url ?? "/apple-touch-icon.png"} />
            <AvatarFallback>
              {voucher.voucher_name?.substring(0, 2).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-5xl font-normal text-primary ">
            {voucher.voucher_name}{" "}
            <span className="font-bold">({voucher.symbol})</span>
          </h1>
        </div>

        {isMounted && token && (
          <VoucherContractFunctions voucher={voucher} token={token} />
        )}
        <Tabs defaultValue="home">
          <TabsList>
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="holders">Holders</TabsTrigger>
            {canEdit && isMounted && (
              <TabsTrigger value="update">
                <EditIcon className="size-4" />
              </TabsTrigger>
            )}
          </TabsList>
          <div className="mt-4 ">
            <TabsContent value="home" className="grid grid-cols-12 mb-4">
              <div className="flex col-span-12 md:col-span-8  flex-col gap-4 p-4  rounded-lg mb-auto">
                {/* Description */}

                <div className="flex ">
                  <p className="py-4">{voucher.voucher_description}</p>
                </div>
                {voucher.banner_url && (
                  <AspectRatio ratio={30 / 10}>
                    <Image
                      src={voucher.banner_url}
                      alt="Banner"
                      fill
                      className="rounded-md object-cover"
                    />
                  </AspectRatio>
                )}
                <div className="flex col-span-12 md:col-span-8 flex-col gap-4 mb-auto">
                  <VoucherDetailItem
                    label="Issuer"
                    value={`${voucher.issuers[0]?.given_names ?? ""} ${voucher.issuers[0]?.family_name ?? ""}`}
                    Icon={UserIcon}
                  />
                  <VoucherDetailItem
                    label="Email"
                    value={voucher.voucher_email}
                    Icon={AtSignIcon}
                  />
                  <VoucherDetailItem
                    label="Website"
                    value={voucher.voucher_website}
                    Icon={GlobeIcon}
                  />
                  <VoucherDetailItem
                    label="Location"
                    value={voucher.location_name}
                    Icon={MapPinIcon}
                  />
                </div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <ProductList
                  className="max-h-[400px]"
                  voucher_id={voucher.id}
                  canEdit={canEdit}
                />
                <h2 className="text-primary-foreground bg-primary rounded-full p-1 px-6 text-base w-fit font-light text-center">
                  Pool Memberships
                </h2>
                {poolsRegistry?.contractAddresses?.map((address) => (
                  <VoucherPoolListItem
                    key={address}
                    poolAddress={address}
                    voucherAddress={voucher_address}
                  />
                ))}
              </div>
              <div className="col-span-12 md:col-span-8 grid items-center grid-cols-2 justify-stretch w-full gap-4 p-4">
                <StatisticsCard
                  className="max-w-[260px]"
                  delta={stats?.transactions.delta || 0}
                  isIncrease={(stats?.transactions.delta || 0) > 0}
                  value={stats?.transactions.total.toString() || 0}
                  title="Transactions"
                  Icon={Icons.hash}
                />
                <StatisticsCard
                  className="max-w-[260px]"
                  delta={stats?.accounts.delta || 0}
                  isIncrease={(stats?.accounts.delta || 0) > 0}
                  value={stats?.accounts.total || 0}
                  title="Active Users"
                  Icon={Icons.person}
                />
              </div>
            </TabsContent>
            <TabsContent value="transactions" className="mt-0">
              <TransactionsTable voucherAddress={voucher_address} />
            </TabsContent>
            <TabsContent value="holders" className="mt-0">
              <VoucherHoldersTable voucherAddress={voucher_address} />
            </TabsContent>
            <TabsContent value="data">
              <div className="grid w-fill gap-2 md:gap-4 grid-cols-2 md:grid-cols-4 items-center">
                <StatisticsCard
                  delta={"-"}
                  isIncrease={false}
                  value={
                    isMounted
                      ? toUserUnits(token?.totalSupply.value, token?.decimals)
                      : "0"
                  }
                  title="Total Supply"
                  Icon={Icons.hash}
                />
                <StatisticsCard
                  delta={toUserUnitsString(
                    BigInt(stats?.volume.delta || 0),
                    token?.decimals
                  )}
                  isIncrease={(stats?.volume.delta || 0) > 0}
                  value={toUserUnitsString(stats?.volume.total)}
                  title="Volume"
                  Icon={Icons.hash}
                />
                <StatisticsCard
                  delta={stats?.transactions.delta || 0}
                  isIncrease={(stats?.transactions.delta || 0) > 0}
                  value={stats?.transactions.total.toString() || 0}
                  title="Transactions"
                  Icon={Icons.hash}
                />
                <StatisticsCard
                  delta={stats?.accounts.delta || 0}
                  isIncrease={(stats?.accounts.delta || 0) > 0}
                  value={stats?.accounts.total || 0}
                  title="Active Users"
                  Icon={Icons.person}
                />
              </div>
              <div className="grid mt-4 gap-4 grid-cols-1 lg:grid-cols-2">
                <div className="col-span-1">
                  <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                      <CardTitle className="text-2xl">Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-6">
                      {voucher_address && (
                        <VoucherInfo token={token} voucher={voucher} />
                      )}
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
                              time: (v.x.getTime() / 1000) as UTCTimestamp,
                              value: parseInt(v.y),
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
                            voucher.geo
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
            <TabsContent value="update">
              <UpdateVoucherForm voucher={voucher} />
            </TabsContent>
          </div>
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
{
  /* <div className="flex flex-wrap justify-between">
  <div className="text-sm font-medium leading-none mb-2">
    {label}
    {info && (
      <span>
        <InfoIcon content={info} />
      </span>
    )}
  </div>
  <div className="grow flex mb-2 justify-end items-center ">
    {typeof value === "function" ? (
      value
    ) : (
      <p className="text-sm font-light leading-none text-end">{value}</p>
    )}
  </div>
</div>; */
}
function VoucherDetailItem(props: {
  label: string;
  value: string | null;
  Icon: React.ElementType;
}) {
  return (
    <div className="flex flex-wrap justify-between ">
      <div className="font-medium leading-none mb-2 flex items-center gap-2">
        <props.Icon className="p-[5px] bg-secondary rounded-full text-secondary-foreground" />{" "}
        {props.label}
      </div>
      <div className="grow flex mb-2 justify-end items-center ">
        <p className="font-light leading-none text-end">{props.value}</p>
      </div>
    </div>
  );
}
