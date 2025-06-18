"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { DatePickerWithRange } from "~/components/date-picker";
import { SelectVoucher } from "~/components/forms/fields/select-voucher-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { VoucherSelectItem } from "~/components/voucher/select-voucher-item";
import { trpc } from "~/lib/trpc";
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
  const vouchers = searchParams.get("vouchers")
    ? searchParams.get("vouchers")!.split(",")
    : [];

  const { data: voucherList } = trpc.voucher.list.useQuery();

  const updateUrl = useCallback(
    (tab: string, from: Date, to: Date, vouchers: string[]) => {
      window.history.replaceState(
        {},
        "",
        `/dashboard?tab=${tab}&from=${from.getTime()}&to=${to.getTime()}&vouchers=${vouchers.join(
          ","
        )}`
      );
    },
    []
  );

  return (
    <Tabs
      className="grid grid-cols-12 gap-2 grow"
      value={tab}
      onValueChange={(t) => updateUrl(t, from, to, vouchers)}
    >
      <div className="col-span-12 my-2 flex items-center justify-between space-y-2 flex-wrap">
        <TabsList>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="pools">Pools</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <div className="flex items-center space-x-2">
          {tab === "reports" && (
            <div className="flex items-center space-x-2">
              <SelectVoucher
                onChange={(vv) => {
                  if (vv instanceof Array) {
                    updateUrl(
                      tab,
                      from,
                      to,
                      vv?.map((v) => v.voucher_address as `0x${string}`) ?? []
                    );
                  }
                }}
                placeholder="Select vouchers"
                value={
                  voucherList?.filter((v) =>
                    vouchers.includes(v.voucher_address as `0x${string}`)
                  ) ?? []
                }
                items={voucherList ?? []}
                renderItem={(v) => (
                  <VoucherSelectItem
                    voucher={{
                      address: v.voucher_address as `0x${string}`,
                      name: v.voucher_name,
                      symbol: v.symbol.toUpperCase(),
                      icon: v.icon_url,
                    }}
                    showBalance={false}
                  />
                )}
                searchableValue={(v) =>
                  `${v.symbol.toUpperCase()} ${v.voucher_name} `
                }
                renderSelectedItem={(v) => (
                  <div className="flex items-center gap-1 px-2">
                    {v.voucher_name}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({v.symbol.toUpperCase()})
                    </span>
                  </div>
                )}
                key="vouchers"
                isMultiSelect={true}
              />
            </div>
          )}
          <DatePickerWithRange
            value={{
              from,
              to,
            }}
            onChange={(newDateRange) => {
              if (newDateRange.from && newDateRange.to) {
                updateUrl(tab, newDateRange.from, newDateRange.to, vouchers);
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
        <ReportsTabContent dateRange={{ from, to }} vouchers={vouchers} />
      </TabsContent>
    </Tabs>
  );
}
