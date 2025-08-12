"use client";

import { type Address } from "viem";
import { ReportsByTagStats } from "~/components/reports/reports-by-tag-stats";

interface ReportsTabContentProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  vouchers: Address[];
}

export function ReportsTabContent({
  dateRange,
  vouchers,
}: ReportsTabContentProps) {
  return (
    <div className="grid grid-cols-12 gap-2 col-span-12 space-y-6">
      <div className="flex flex-col col-span-12 sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Reports by Tag</h2>
      </div>

      <ReportsByTagStats dateRange={dateRange} vouchers={vouchers} />
    </div>
  );
}
