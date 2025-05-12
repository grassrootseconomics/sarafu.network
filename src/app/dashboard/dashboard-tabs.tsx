import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DatePickerWithRange } from "~/components/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PoolsTabContent } from "./pools-tab-content";
import { ReportsTabContent } from "./reports-tab-content";
import { VouchersTabContent } from "./vouchers-tab-content";

export function DashboardTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab =
    tabParam && ["vouchers", "pools", "reports"].includes(tabParam)
      ? tabParam
      : "vouchers";

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs
      className="grid grid-cols-12 gap-2 grow"
      value={activeTab}
      onValueChange={handleTabChange}
    >
      <div className="col-span-12 my-2 flex items-center justify-between space-y-2 flex-wrap">
        <TabsList>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="pools">Pools</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <div className="flex items-center space-x-2">
          <DatePickerWithRange
            value={dateRange}
            onChange={(newDateRange) => {
              if (newDateRange.from && newDateRange.to) {
                setDateRange({
                  from: newDateRange.from,
                  to: newDateRange.to,
                });
              }
            }}
          />
        </div>
      </div>

      <TabsContent
        value="vouchers"
        className="grid grid-cols-12 col-span-12 gap-2 m-1 md:m-4 grow"
      >
        <VouchersTabContent dateRange={dateRange} />
      </TabsContent>

      <TabsContent
        value="pools"
        className="grid grid-cols-12 col-span-12 gap-2 m-1 md:m-4 grow"
      >
        <PoolsTabContent dateRange={dateRange} />
      </TabsContent>

      <TabsContent
        value="reports"
        className="grid grid-cols-12 col-span-12 gap-2 m-1 md:m-4 grow"
      >
        <ReportsTabContent dateRange={dateRange} />
      </TabsContent>
    </Tabs>
  );
}
