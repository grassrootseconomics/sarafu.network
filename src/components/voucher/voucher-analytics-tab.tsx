import React from "react";
import { trpc } from "~/lib/trpc";
import { type VoucherDetails } from "../pools/contract-functions";
import { ReportsByTagStats } from "../reports/reports-by-tag-stats";
import { VoucherAnalyticsCharts } from "./voucher-analytics-charts";
import { VoucherStatisticsGrid } from "./voucher-statistics-grid";

interface VoucherAnalyticsTabProps {
  voucherAddress: `0x${string}`;
  details: VoucherDetails;
}

export function VoucherAnalyticsTab({
  voucherAddress,
  details,
}: VoucherAnalyticsTabProps) {
  // Memoize the dateRange to prevent infinite re-renders
  const dateRange = React.useMemo(() => {
    const from = new Date(new Date().setMonth(new Date().getMonth() - 1));
    const to = new Date();
    return { from, to };
  }, []);

  // Memoize the vouchers array to prevent infinite re-renders
  const vouchers = React.useMemo(() => [voucherAddress], [voucherAddress]);

  const { data: voucher } = trpc.voucher.byAddress.useQuery(
    { voucherAddress },
    {
      enabled: !!voucherAddress,
      staleTime: 60_000,
    }
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Voucher Analytics
        </h2>
        <VoucherStatisticsGrid
          dateRange={dateRange}
          voucherAddress={voucherAddress}
          details={details}
        />
      </div>

      <VoucherAnalyticsCharts
        voucherAddress={voucherAddress}
        voucher={voucher}
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-semibold">Reports by Tag</h2>
        </div>
        <ReportsByTagStats dateRange={dateRange} vouchers={vouchers} />
      </div>
    </div>
  );
}
