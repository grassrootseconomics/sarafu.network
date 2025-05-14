import { RepeatIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type DateRange } from "react-day-picker";
import StatisticsCard from "~/components/cards/statistics-card";
import { Icons } from "~/components/icons";
import { useContractIndex } from "~/components/pools/hooks";
import { BasicTable } from "~/components/tables/table";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Name } from "~/contracts/react";
import { env } from "~/env";
import { trpc } from "~/lib/trpc";

export function PoolsTabContent({ dateRange }: { dateRange: DateRange }) {
  const swapPools = useContractIndex(env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS);
  const swapPoolAddresses = swapPools?.data?.contractAddresses;
  const router = useRouter();
  const { data: poolStats } = trpc.pool.statistics.useQuery(
    {
      dateRange: dateRange as { from: Date; to: Date },
      addresses: swapPoolAddresses ?? [],
    },
    {
      enabled: !!dateRange.from && !!dateRange.to,
      staleTime: 1000 * 60 * 60, // 1 hour
    }
  );

  return (
    <>
      <div className="grid col-span-12 w-fill gap-4 grid-cols-2 sm:grid-cols-4">
        <StatisticsCard
          delta={0}
          isIncrease={false}
          value={Number(swapPools?.data?.entryCount ?? 0)}
          title="No. Pools"
          Icon={Icons.pools}
        />
        <StatisticsCard
          delta={0}
          isIncrease={false}
          value={
            poolStats?.reduce((acc, stat) => acc + stat.unique_swappers, 0) ?? 0
          }
          title="Unique Swappers"
          Icon={Icons.person}
        />
        <StatisticsCard
          delta={0}
          isIncrease={false}
          value={
            poolStats?.reduce((acc, stat) => acc + stat.total_swaps, 0) ?? 0
          }
          title="Total Swaps"
          Icon={RepeatIcon}
        />
      </div>

      <Card className="col-span-12 mt-2">
        <CardTitle className="m-4 text-center">Pool Statistics</CardTitle>
        <CardContent className="p-0">
          <BasicTable
            stickyHeader
            downloadFileName={`pool-stats(${dateRange.from?.toLocaleDateString()}-${dateRange.to?.toLocaleDateString()}).csv`}
            onRowClick={(row) => {
              router.push(`/pools/${row.pool_address}`);
            }}
            containerClassName="h-[400px]"
            columns={[
              {
                accessorKey: "pool_address",
                header: "Pool",
                cell: (info) => (
                  <Name address={info.getValue() as `0x${string}`} />
                ),
              },
              {
                accessorKey: "total_swaps",
                header: "Total Swaps",
                cell: (info) => info.getValue(),
              },
              {
                accessorKey: "total_deposits",
                header: "Total Deposits",
                cell: (info) => info.getValue(),
              },
              {
                accessorKey: "unique_swappers",
                header: "Unique Swappers",
                cell: (info) => info.getValue(),
              },
              {
                accessorKey: "unique_depositors",
                header: "Unique Depositors",
                cell: (info) => info.getValue(),
              },
            ]}
            data={poolStats ?? []}
          />
        </CardContent>
      </Card>
    </>
  );
}
