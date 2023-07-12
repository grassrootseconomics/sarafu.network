import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { formatUnits } from "viem";

import { type UTCTimestamp } from "lightweight-charts";
import Head from "next/head";
import { useToken } from "wagmi";
import StatisticsCard from "~/components/cards/statistics-card";
import { LineChart } from "~/components/charts/line-chart";
import { HoldersTable } from "~/components/tables/holders-table";
import { TransactionsTable } from "~/components/tables/transactions-table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import UpdateVoucherDialog from "~/components/voucher/update-voucher-dialog";
import { useUser } from "~/hooks/useUser";
import { api } from "~/utils/api";
import { VoucherInfo } from "../../components/voucher/voucher-info";

const LocationMap = dynamic(() => import("../../components/location-map"), {
  ssr: false,
});

const VoucherPage = () => {
  const router = useRouter();
  const address = router.query.address as `0x${string}`;
  const user = useUser();
  const isMounted = useIsMounted();
    voucherAddress: address,
  });
  const { data: token } = useToken({
    address: address,
  });
  const { data: txsPerDay, isLoading: txsPerDayLoading } =
    api.transaction.transactionsPerDay.useQuery({
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
  const parseValue = (value?: bigint) =>
    value ? formatUnits(value, token?.decimals ?? 6) : "0";
  if (!voucher) return <div>Voucher not Found</div>;

  return (
    <div className="mx-4">
      <Head>
        <title>{voucher.voucher_name} Voucher</title>
        <meta
          name="description"
          content={voucher.voucher_description}
          key="desc"
        />
        <meta property="og:title" content={`${voucher.voucher_name} Voucher`} />
        <meta property="og:description" content={voucher.voucher_description} />
      </Head>
      <h1 className="text-center text-3xl mt-8 mb-4 font-extrabold">
        {voucher.voucher_name} Voucher
      </h1>

      <div className="grid w-fill gap-4 xs:grid-cols-1 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isMounted ? parseValue(token?.totalSupply.value) : ""}
            </div>
            {/* <p className="text-xs text-muted-foreground">
              {delta} from last month
            </p> */}
          </CardContent>
        </Card>
        <StatisticsCard
          delta={parseValue(BigInt(monthlyStats?.volume.delta || 0))}
          isIncrease={(monthlyStats?.volume.delta || 0) > 0}
          value={parseValue(monthlyStats?.volume.total)}
          title="Volume"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatisticsCard
          delta={monthlyStats?.transactions.delta || 0}
          isIncrease={(monthlyStats?.transactions.delta || 0) > 0}
          value={monthlyStats?.transactions.total.toString() || 0}
          title="Transactions"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatisticsCard
          delta={monthlyStats?.users.delta || 0}
          isIncrease={(monthlyStats?.users.delta || 0) > 0}
          value={monthlyStats?.users.total || 0}
          title="Active Users"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
      </div>
      <div className="grid mt-4 gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-2xl">Information</CardTitle>
            {user.isAdmin && <UpdateVoucherDialog voucher={voucher} />}
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
                      value: parseInt(parseValue(BigInt(v.y))),
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
