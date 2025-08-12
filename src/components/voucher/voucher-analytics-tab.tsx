import { ReportsByTagStats } from "../reports/reports-by-tag-stats";
import { VoucherStatisticsGrid } from "./voucher-statistics-grid";
import { VoucherAnalyticsCharts } from "./voucher-analytics-charts";
import { type VoucherDetails } from "../pools/contract-functions";
import { trpc } from "~/lib/trpc";

interface VoucherAnalyticsTabProps {
  voucherAddress: `0x${string}`;
  details: VoucherDetails;
}

export function VoucherAnalyticsTab({
  voucherAddress,
  details,
}: VoucherAnalyticsTabProps) {
  const from = new Date(new Date().setMonth(new Date().getMonth() - 1));
  const to = new Date();
  
  const { data: voucher } = trpc.voucher.byAddress.useQuery(
    { voucherAddress },
    {
      enabled: !!voucherAddress,
      staleTime: 60_000,
    }
  );
  
  const { data: stats } = trpc.stats.voucherStats.useQuery({
    voucherAddress,
    dateRange: {
      from,
      to,
    },
  });
  
  const { data: txsPerDay } = trpc.stats.txsPerDay.useQuery({
    voucherAddress,
  });
  
  const { data: volumePerDay } = trpc.stats.voucherVolumePerDay.useQuery({
    voucherAddress,
  });
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Voucher Analytics
        </h2>
        <VoucherStatisticsGrid 
          stats={stats}
          voucherAddress={voucherAddress}
          details={details}
        />
      </div>

      <VoucherAnalyticsCharts
        voucherAddress={voucherAddress}
        voucher={voucher}
        txsPerDay={txsPerDay}
        volumePerDay={volumePerDay}
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-semibold">Reports by Tag</h2>
        </div>
        <ReportsByTagStats
          dateRange={{ from, to }}
          vouchers={[voucherAddress]}
        />
      </div>
    </div>
  );
}