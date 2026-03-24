"use client";

import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { DatePickerWithRange } from "~/components/date-picker";
import { type SwapPool } from "~/components/pools/types";
import { PoolChartsWrapper } from "./pool-charts-client";

export function PoolAnalyticsWrapper({ pool }: { pool: SwapPool }) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Default to last month
    to: new Date(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Analytics</h2>
        <DatePickerWithRange
          value={dateRange}
          onChange={(newRange) => setDateRange(newRange)}
          placeholder="Select date range for analytics"
        />
      </div>
      <PoolChartsWrapper pool={pool} dateRange={dateRange} />
    </div>
  );
}
