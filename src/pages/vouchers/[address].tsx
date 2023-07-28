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
import { toUserUnitsString } from "~/utils/units";

import Head from "next/head";
import { useToken } from "wagmi";
import StatisticsCard from "~/components/cards/statistics-card";
import { Icons } from "~/components/icons";
import { PageSendButton } from "~/components/send-dialog";
import { HoldersTable } from "~/components/tables/holders-table";
import { TransactionsTable } from "~/components/tables/transactions-table";
import { CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import UpdateVoucherDialog from "~/components/voucher/update-voucher-dialog";
import { useUser } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { kysely } from "~/server/db";
import SuperJson from "~/utils/trpc-transformer";
import { VoucherInfo } from "../../components/voucher/voucher-info";

const LocationMap = dynamic(() => import("../../components/location-map"), {
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

const VoucherPage = () => {
  const router = useRouter();
  const address = router.query.address as `0x${string}`;
  const user = useUser();
  const isMounted = useIsMounted();
  const { data: voucher } = api.voucher.byAddress.useQuery({
    voucherAddress: address,
  });
  const { data: token } = useToken({
    address: address,
  });
  const { data: txsPerDay, isLoading: txsPerDayLoading } =
    api.transaction.txsPerDay.useQuery({
      voucherAddress: address,
    });
  const { data: volumnPerDay, isLoading: volumnPerDayLoading } =
    api.voucher.volumePerDay.useQuery({
      voucherAddress: address,
    });
  const { data: monthlyStats, isLoading: statsLoading } =
    api.voucher.monthlyStats.useQuery({
      voucherAddress: address,
    });

  if (!voucher) return <div>Voucher not Found</div>;

  return (
    <div className="mx-4">
      <Head>
        <title>{`${voucher.voucher_name} Voucher`}</title>
        <meta
          name="description"
          content={voucher.voucher_description}
          key="desc"
        />
        <meta property="og:title" content={`${voucher.voucher_name} Voucher`} />
        <meta property="og:description" content={voucher.voucher_description} />
      </Head>
      <PageSendButton voucherAddress={address} />
      <h1 className="text-center text-3xl mt-8 mb-4 font-extrabold">
        {voucher.voucher_name} Voucher
      </h1>

      <div className="grid w-fill gap-4 xs:grid-cols-1 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
            <Icons.hash />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isMounted
                ? toUserUnitsString(token?.totalSupply.value, token?.decimals)
                : ""}
            </div>
            {/* <p className="text-xs text-muted-foreground">
              {delta} from last month
            </p> */}
          </CardContent>
        </Card>
        <StatisticsCard
          delta={toUserUnitsString(
            BigInt(monthlyStats?.volume.delta || 0),
            token?.decimals
          )}
          isIncrease={(monthlyStats?.volume.delta || 0) > 0}
          value={toUserUnitsString(monthlyStats?.volume.total)}
          title="Volume"
          icon={<Icons.hash />}
        />
        <StatisticsCard
          delta={monthlyStats?.transactions.delta || 0}
          isIncrease={(monthlyStats?.transactions.delta || 0) > 0}
          value={monthlyStats?.transactions.total.toString() || 0}
          title="Transactions"
          icon={<Icons.hash />}
        />
        <StatisticsCard
          delta={monthlyStats?.accounts.delta || 0}
          isIncrease={(monthlyStats?.accounts.delta || 0) > 0}
          value={monthlyStats?.accounts.total || 0}
          title="Active Users"
          icon={<Icons.person />}
        />
      </div>
      <div className="grid mt-4 gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-2xl">Information</CardTitle>
            {user.isStaff && isMounted && (
              <UpdateVoucherDialog voucher={voucher} />
            )}
          </CardHeader>
          <CardContent className="pl-6">
            {address && <VoucherInfo token={token} voucher={voucher} />}
          </CardContent>
        </Card>

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
              <TransactionsTable voucherAddress={address} />
            </TabsContent>
            <TabsContent value="holders" className="mt-0">
              <HoldersTable voucherAddress={address} />
            </TabsContent>
            <TabsContent value="marketplace" className="mt-0"></TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default VoucherPage;
