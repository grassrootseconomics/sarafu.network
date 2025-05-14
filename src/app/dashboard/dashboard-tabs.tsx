"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { DatePickerWithRange } from "~/components/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PoolsTabContent } from "./pools-tab-content";
import { ReportsTabContent } from "./reports-tab-content";
import { VouchersTabContent } from "./vouchers-tab-content";

export function DashboardTabs() {
  // Initialize with default tab
  const searchParams = useSearchParams();
  const from = searchParams.get("from")
    ? new Date(parseInt(searchParams.get("from")!))
    : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const to = searchParams.get("to")
    ? new Date(parseInt(searchParams.get("to")!))
    : new Date();
  const tab = searchParams.get("tab") ?? "vouchers";

  const updateUrl = useCallback((tab: string, from: Date, to: Date) => {
    window.history.replaceState(
      {},
      "",
      `/dashboard?tab=${tab}&from=${from.getTime()}&to=${to.getTime()}`
    );
  }, []);

  return (
    <Tabs
      className="grid grid-cols-12 gap-2 grow"
      value={tab}
      onValueChange={(v) => updateUrl(v, from, to)}
    >
      <div className="col-span-12 my-2 flex items-center justify-between space-y-2 flex-wrap">
        <TabsList>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="pools">Pools</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <div className="flex items-center space-x-2">
          <DatePickerWithRange
            value={{
              from,
              to,
            }}
            onChange={(newDateRange) => {
              if (newDateRange.from && newDateRange.to) {
                updateUrl(tab, newDateRange.from, newDateRange.to);
              }
            }}
          />
        </div>
      </div>

      <TabsContent
        value="vouchers"
        className="grid grid-cols-12 col-span-12 gap-2 grow"
      >
        <VouchersTabContent dateRange={{ from, to }} />
      </TabsContent>

      <TabsContent
        value="pools"
        className="grid grid-cols-12 col-span-12 gap-2 grow"
      >
        <PoolsTabContent dateRange={{ from, to }} />
      </TabsContent>

      <TabsContent
        value="reports"
        className="grid grid-cols-12 col-span-12 gap-2 grow"
      >
        <ReportsTabContent dateRange={{ from, to }} />
      </TabsContent>
    </Tabs>
  );
}
