import { DatePickerWithRange } from "~/components/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { VouchersTabContent } from "./vouchers-tab-content";
import { PoolsTabContent } from "./pools-tab-content";
import { useState } from "react";

export function DashboardTabs() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  return (
    <Tabs className="grid grid-cols-12 gap-2 grow" defaultValue="vouchers">
      <div className="col-span-12 my-2 flex items-center justify-between space-y-2 flex-wrap">
        <TabsList>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="pools">Pools</TabsTrigger>
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

      <TabsContent value="vouchers" className="grid grid-cols-12 col-span-12 gap-2 m-1 md:m-4 grow">
        <VouchersTabContent dateRange={dateRange} />
      </TabsContent>

      <TabsContent value="pools" className="grid grid-cols-12 col-span-12 gap-2 m-1 md:m-4 grow">
        <PoolsTabContent dateRange={dateRange} />  
      </TabsContent>
    </Tabs>
  );
} 