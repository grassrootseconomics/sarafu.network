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

export function ReportsTabContent({ dateRange, vouchers }: ReportsTabContentProps) {
  return (
    <div className="grid grid-cols-12 gap-2 col-span-12">
      <ReportsByTagStats dateRange={dateRange} vouchers={vouchers} />
    </div>
  );
}
