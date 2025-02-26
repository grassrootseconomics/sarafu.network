import { type UTCTimestamp } from "lightweight-charts";
import { useRouter } from "next/navigation";
import StatisticsCard from "~/components/cards/statistics-card";
import { LineChart } from "~/components/charts/line-chart";
import { Icons } from "~/components/icons";
import { BasicTable } from "~/components/tables/table";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { VoucherChip } from "~/components/voucher/voucher-chip";
import { trpc } from "~/lib/trpc";

type DateRange = {
  from: Date;
  to: Date;
};
export function VouchersTabContent({ dateRange }: { dateRange: DateRange }) {
  const { data: stats } = trpc.stats.voucherStats.useQuery({
    dateRange: dateRange,
  });

  const { data: vouchersCount } = trpc.voucher.count.useQuery(undefined);

  const { data: statsPerVoucher, isLoading: pmLoading } =
    trpc.stats.statsPerVoucher.useQuery({
      dateRange: dateRange,
    });

  const txsPerDayQuery = trpc.stats.txsPerDay.useQuery({
    dateRange: dateRange,
  });

  const router = useRouter();

  return (
    <>
      <div className="grid col-span-12 w-fill gap-4 grid-cols-2 sm:grid-cols-4">
        <StatisticsCard
          delta={0}
          isIncrease={false}
          value={vouchersCount ?? 0}
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
              router.push(`/vouchers/${row.voucher_address}`);
            }}
            containerClassName="h-[400px]"
            columns={[
              {
                accessorKey: "voucher_name",
                header: "Voucher",
                cell: (info) => (
                  <VoucherChip
                    truncate
                    voucher_address={
                      info.row.original.voucher_address as `0x${string}`
                    }
                  />
                ),
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
    </>
  );
}
