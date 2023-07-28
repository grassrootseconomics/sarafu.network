/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createServerSideHelpers } from "@trpc/react-query/server";
import { UTCTimestamp } from "lightweight-charts";
import { InferGetStaticPropsType } from "next";
import React from "react";
import StatisticsCard from "~/components/cards/statistics-card";
import { LineChart } from "~/components/charts/line-chart";
import { DatePickerWithRange } from "~/components/date-picker";
import { Icons } from "~/components/icons";

import { PageSendButton } from "~/components/send-dialog";
import { BasicTable } from "~/components/tables/table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { appRouter } from "~/server/api/root";
import { kysely } from "~/server/db";
import { api } from "~/utils/api";
import SuperJson from "~/utils/trpc-transformer";
export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      kysely: kysely,
      session: undefined,
    },
    transformer: SuperJson, // optional - adds superjson serialization
  });

  await helpers.voucher.all.prefetch();

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
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const { data: vouchers } = api.voucher.all.useQuery(undefined, {
    initialData: [],
  });
  const [dateRange, setDateRange] = React.useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const { data: monthlyStats, isLoading: statsLoading } =
    api.voucher.monthlyStats.useQuery({});
  const { data: monthlyStatsPerVoucher, isLoading: pmLoading } =
    api.voucher.monthlyStatsPerVoucher.useQuery(
      {
        dateRange: dateRange,
      },
      {
        queryKey: ["voucher.monthlyStatsPerVoucher", { dateRange }],
      }
    );
  const txsPerDayQuery = api.transaction.txsPerDay.useQuery({
    dateRange: dateRange,
  });

  return (
    <>
      <PageSendButton />
      <div className="grid grid-cols-12 gap-2 m-4">
        <div className="grid col-span-12 w-fill gap-4 xs:grid-cols-1 sm:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                No. Vouchers
              </CardTitle>
              <Icons.logo width={20} height={20} prefix="card" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vouchers?.length}</div>
            </CardContent>
          </Card>
          <StatisticsCard
            delta={monthlyStats?.accounts.delta || 0}
            isIncrease={(monthlyStats?.accounts.delta || 0) > 0}
            value={<>{monthlyStats?.accounts.total || 0}</>}
            title="Active Accounts"
            icon={<Icons.person />}
          />
          <StatisticsCard
            delta={monthlyStats?.transactions.delta || 0}
            isIncrease={(monthlyStats?.transactions.delta || 0) > 0}
            value={monthlyStats?.transactions.total.toString() || 0}
            title="Transactions"
            icon={<Icons.hash />}
          />
        </div>
        <div className="col-span-12 mt-2">
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
        <Card className="col-span-12 md:col-span-6 mt-2 ">
          <CardTitle className="m-4 text-center">Stats</CardTitle>
          <CardContent className="p-0">
            <BasicTable
              stickyHeader
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
                  header: "Δ Transactions",
                  cell: (info) =>
                    info.getValue() > 0
                      ? `+${info.getValue()}`
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
                    info.getValue() > 0
                      ? `+${info.getValue()}`
                      : info.getValue(),
                },
              ]}
              data={monthlyStatsPerVoucher ?? []}
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
      </div>
    </>
  );
};

export default DashboardPage;
