"use client";

import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { DatePickerWithRange } from "~/components/date-picker";
import { Icons } from "~/components/icons";
import { ContentContainer } from "~/components/layout/content-container";
import { UpdatePoolForm } from "~/components/pools/forms/update-pool-form";
import { PoolCharts } from "~/components/pools/pool-charts";
import { PoolDetails } from "~/components/pools/pool-details";
import { PoolTransactionsTable } from "~/components/pools/tables/pool-transactions-table";
import { PoolVoucherTable } from "~/components/pools/tables/pool-voucher-table";
import { type SwapPool } from "~/components/pools/types";
import { Tabs, TabsContent } from "~/components/ui/tabs";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";

export default function PoolPageClient({
  pool,
  pool_address,
}: {
  pool: SwapPool;
  pool_address: `0x${string}`;
}) {
  const auth = useAuth();
  const { data: poolData } = trpc.pool.get.useQuery(pool_address);
  const isOwner = Boolean(
    auth?.session && pool?.owner && pool?.owner === auth?.session?.address
  );

  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  return (
    <ContentContainer title={pool?.name ?? ""} Icon={Icons.pools}>
      {/* ... */}
      <BreadcrumbResponsive
        items={[
          { label: "Home", href: "/" },
          { label: "Pools", href: "/pools" },
          { label: pool?.name ?? "" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8 ">
        {/* ... */}
        <div className="mt-8">
          <Tabs defaultValue="vouchers" className="w-full">
            {/* ... */}
            <div className="bg-white shadow-md rounded-lg">
              <TabsContent value="vouchers" className="p-0">
                <PoolVoucherTable isWriter={isOwner} pool={pool} />
              </TabsContent>
              <TabsContent value="transactions" className="p-0">
                <PoolTransactionsTable pool={pool} />
              </TabsContent>
              <TabsContent value="data" className="p-6">
                <PoolDetails address={pool_address} />
              </TabsContent>
              <TabsContent value="edit" className="p-6">
                <UpdatePoolForm
                  address={pool_address}
                  poolDescription={poolData?.swap_pool_description}
                  bannerUrl={poolData?.banner_url}
                  poolTags={poolData?.tags}
                />
              </TabsContent>
              <TabsContent value="charts" className="p-6">
                <div className="mb-4">
                  <DatePickerWithRange
                    value={dateRange}
                    onChange={(newRange) => setDateRange(newRange)}
                  />
                </div>
                <PoolCharts pool={pool} dateRange={dateRange} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </ContentContainer>
  );
}
