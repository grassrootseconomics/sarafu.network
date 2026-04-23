"use client";
import { type DateRange } from "react-day-picker";
import { PoolCharts } from "~/components/pools/pool-charts";
import { type SwapPool } from "~/components/pools/types";
import { ReportsByTagStats } from "~/components/reports/reports-by-tag-stats";

export function PoolChartsWrapper({
  pool,
  dateRange,
}: {
  pool: SwapPool;
  dateRange: DateRange;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Reports by Tag</h3>
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Analyzing reports from{" "}
            <strong>{pool.vouchers.length} vouchers</strong> in this pool for
            the selected time period.
          </p>
        </div>
        <ReportsByTagStats
          dateRange={
            dateRange as {
              from: Date;
              to: Date;
            }
          }
          vouchers={pool.vouchers}
        />
      </div>
      <PoolCharts pool={pool} dateRange={dateRange} />
    </div>
  );
}
