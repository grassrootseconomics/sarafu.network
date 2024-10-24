"use client";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { DatePickerWithRange } from "~/components/date-picker";
import { PoolCharts } from "~/components/pools/pool-charts";
import { type SwapPool } from "~/components/pools/types";

export function PoolChartsWrapper({ pool }: { pool: SwapPool }) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  return (
    <>
      <div className="mb-4">
        <DatePickerWithRange
          value={dateRange}
          onChange={(newRange) => setDateRange(newRange)}
        />
      </div>
      <PoolCharts pool={pool} dateRange={dateRange} />
    </>
  );
}
