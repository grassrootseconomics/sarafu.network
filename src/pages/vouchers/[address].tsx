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

import Head from "next/head";
import { useToken } from "wagmi";
import StatisticsCard from "~/components/cards/statistics-card";
import { Icons } from "~/components/icons";
import { TransactionsTable } from "~/components/tables/transactions-table";
import { CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import UpdateVoucherDialog from "~/components/voucher/dialog/update-voucher-dialog";
import { VoucherContractFunctions } from "~/components/voucher/voucher-contract-functions";
import { VoucherHoldersTable } from "~/components/voucher/voucher-holders-table";
import { useUser } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { kysely } from "~/server/db";
import SuperJson from "~/utils/trpc-transformer";
import { VoucherInfo } from "../../components/voucher/voucher-info";

const LocationMap = dynamic(() => import("../../components/map/location-map"), {
  ssr: false,
});

export async function getStaticProps(
  context: GetStaticPropsContext<{ address: string }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      kysely: kysely,
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
  const vouchers = await kysely
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
  const user = useUser();
  const isMounted = useIsMounted();
  const { data: voucher } = api.voucher.byAddress.useQuery({
    voucherAddress: voucher_address,
  });
  const { data: token } = useToken({
    address: voucher_address,
    staleTime: 2_000,
    enabled: !!voucher_address,
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
  if (!voucher) return <div>Voucher not Found</div>;
  return (
    <div className="mx-1 sm:mx-2">
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
      <h1 className="text-center text-3xl mt-8 mb-4 font-extrabold">
        {voucher.voucher_name}
      </h1>

      <div className="hidden sm:grid w-fill gap-4 grid-cols-1 sm:grid-cols-4 items-center">
        <StatisticsCard
          delta={"-"}
          isIncrease={false}
          value={
            isMounted
              ? toUserUnits(token?.totalSupply.value, token?.decimals)
              : "0"
          }
          title="Total Supply"
          icon={<Icons.hash />}
        />
        <StatisticsCard
          delta={toUserUnitsString(
            BigInt(stats?.volume.delta || 0),
            token?.decimals
          )}
          isIncrease={(stats?.volume.delta || 0) > 0}
          value={toUserUnitsString(stats?.volume.total)}
          title="Volume"
          icon={<Icons.hash />}
        />
        <StatisticsCard
          delta={stats?.transactions.delta || 0}
          isIncrease={(stats?.transactions.delta || 0) > 0}
          value={stats?.transactions.total.toString() || 0}
          title="Transactions"
          icon={<Icons.hash />}
        />
        <StatisticsCard
          delta={stats?.accounts.delta || 0}
          isIncrease={(stats?.accounts.delta || 0) > 0}
          value={stats?.accounts.total || 0}
          title="Active Users"
          icon={<Icons.person />}
        />
      </div>
      <div className="grid mt-4 gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="col-span-1">
          {isMounted && (
            <VoucherContractFunctions voucher={voucher} token={token} />
          )}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-2xl">Information</CardTitle>
              {user?.isStaff && isMounted && (
                <UpdateVoucherDialog voucher={voucher} />
              )}
            </CardHeader>
            <CardContent className="pl-6">
              {voucher_address && (
                <VoucherInfo token={token} voucher={voucher} />
              )}
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="transactions" className="col-span-1">
          <TabsList>
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
                  style={{ height: "350px", width: "100%" }}
                  value={
                    voucher.geo
                      ? { lat: voucher.geo?.x, lng: voucher.geo?.y }
                      : undefined
                  }
                />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>

      <Tabs defaultValue="transactions" className="col-span-4 mt-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="holders">Holders</TabsTrigger>
          <TabsTrigger value="marketplace" disabled>
            Marketplace
          </TabsTrigger>
        </TabsList>
        <Card className="col-span-1 overflow-hidden mt-4">
          <CardContent className="p-0">
            <TabsContent value="transactions" className="mt-0">
              <TransactionsTable voucherAddress={voucher_address} />
            </TabsContent>
            <TabsContent value="holders" className="mt-0">
              <VoucherHoldersTable voucherAddress={voucher_address} />
            </TabsContent>
            <TabsContent value="marketplace" className="mt-0"></TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default VoucherPage;
