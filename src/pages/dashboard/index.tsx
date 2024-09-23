/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createServerSideHelpers } from "@trpc/react-query/server";
import { type UTCTimestamp } from "lightweight-charts";
import { type InferGetStaticPropsType } from "next";
import React from "react";
import StatisticsCard from "~/components/cards/statistics-card";
import { LineChart } from "~/components/charts/line-chart";
import { DatePickerWithRange } from "~/components/date-picker";
import { Icons } from "~/components/icons";

import { useRouter } from "next/router";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { ContentContainer } from "~/components/layout/content-container";
import { BasicTable } from "~/components/tables/table";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { appRouter } from "~/server/api/root";
import { graphDB, indexerDB } from "~/server/db";
import { api } from "~/utils/api";
import SuperJson from "~/utils/trpc-transformer";
export async function getStaticProps() {
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

  await helpers.voucher.list.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 60, // In seconds
  };
}
const DashboardPage = (
  _props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const router = useRouter();
  const [dateRange, setDateRange] = React.useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const { data: stats } = api.stats.voucherStats.useQuery({
    dateRange: dateRange,
  });
  const { data: vouchers } = api.voucher.list.useQuery(undefined, {
    initialData: [],
  });
  const { data: statsPerVoucher, isLoading: pmLoading } =
    api.stats.statsPerVoucher.useQuery({
      dateRange: dateRange,
    });
  const txsPerDayQuery = api.stats.txsPerDay.useQuery({
    dateRange: dateRange,
  });
  return (
    <ContentContainer title="Dashboard">
      <BreadcrumbResponsive
        items={[
          {
            label: "Home",
            href: "/",
          },
          { label: "Dashboard" },
        ]}
      />
      <Tabs className="grid grid-cols-12 gap-2 grow" defaultValue="vouchers">
        <div className="col-span-12 my-2 flex items-center justify-between space-y-2 flex-wrap">
          <TabsList>
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger value="pools" disabled>
              Pools
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-2">
            <DatePickerWithRange
              value={dateRange}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              onChange={(newDateRange) => {
                if (newDateRange.from && newDateRange.to) {
                  setDateRange({
                    from: newDateRange.from,
                    to: newDateRange.to,
                  });
                }
              }}
            />
          </div>
        </div>

        <TabsContent
          value="vouchers"
          className="grid grid-cols-12 col-span-12 gap-2 m-1 md:m-4 grow"
        >
          <div className="grid col-span-12 w-fill gap-4 grid-cols-2 sm:grid-cols-4">
            <StatisticsCard
              delta={0}
              isIncrease={false}
              value={vouchers.length ?? 0}
              title="No. Vouchers"
              Icon={Icons.sarafu_mono}
              iconClassName="grayscale invert"
            />
            <StatisticsCard
              delta={stats?.accounts.delta || 0}
              isIncrease={(stats?.accounts.delta || 0) > 0}
              value={<>{stats?.accounts.total || 0}</>}
              title="Active Accounts"
              Icon={Icons.person}
            />
            <StatisticsCard
              delta={stats?.transactions.delta || 0}
              isIncrease={(stats?.transactions.delta || 0) > 0}
              value={stats?.transactions.total.toString() || 0}
              title="Transactions"
              Icon={Icons.hash}
            />
          </div>

          <Card className="col-span-12 md:col-span-6 mt-2 ">
            <div className="relative">
              <CardTitle className="m-4 text-center">Stats</CardTitle>
            </div>
            <CardContent className="p-0">
              <BasicTable
                stickyHeader
                downloadFileName={`voucher-stats(${dateRange.from.toLocaleDateString()}-${dateRange.to.toLocaleDateString()}).csv`}
                onRowClick={(row) => {
                  router.push(`/vouchers/${row.voucher_address}`).catch(() => {
                    console.error("Failed to navigate to voucher page");
                  });
                }}
                containerClassName="h-[400px]"
                columns={[
                  {
                    accessorKey: "voucher_name",
                    header: "Voucher",
                    cell: (info) => info.getValue(),
                  },
                  {
                    accessorKey: "this_period_total",
                    header: "Transactions",
                    cell: (info) => info.getValue(),
                  },
                  {
                    accessorFn: (row) =>
                      row.this_period_total - row.last_period_total,
                    header: "Δ",
                    cell: (info) =>
                      info.getValue<number>() > 0
                        ? `+${info.getValue<number>()}`
                        : info.getValue(),
                    sortingFn: "basic",
                  },
                  {
                    accessorKey: "unique_accounts_this_period",
                    header: "Active Accounts",
                    cell: (info) => info.getValue(),
                  },
                  {
                    header: "Δ Accounts",
                    accessorFn: (row) =>
                      row.unique_accounts_this_period -
                      row.unique_accounts_last_period,

                    cell: (info) =>
                      info.getValue<number>() > 0
                        ? `+${info.getValue<number>()}`
                        : info.getValue(),
                  },
                ]}
                data={statsPerVoucher ?? []}
                isLoading={pmLoading}
              />
            </CardContent>
          </Card>

          <Card className="col-span-12 md:col-span-6 mt-2">
            <CardTitle className="m-4 text-center">Transactions</CardTitle>
            <CardContent className="p-0">
              <LineChart
                height={400}
                data={
                  txsPerDayQuery.data?.map((v) => ({
                    time: (v.x.getTime() / 1000) as UTCTimestamp,
                    value: parseInt(v.y),
                  })) || []
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ContentContainer>
  );
};

export default DashboardPage;
