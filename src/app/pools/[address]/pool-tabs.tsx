"use client";

import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  PackageIcon,
  SettingsIcon,
} from "lucide-react";
import { useState } from "react";
import { Icons } from "~/components/icons";
import { UpdatePoolForm } from "~/components/pools/forms/update-pool-form";
import { PoolDetails } from "~/components/pools/pool-details";
import { PoolProductsList } from "~/components/pools/pool-products-list";
import { PoolTransactionsTable } from "~/components/pools/tables/pool-transactions-table";
import { PoolVoucherTable } from "~/components/pools/tables/pool-voucher-table";
import { type SwapPool } from "~/components/pools/types";
import { ReportList } from "~/components/reports/report-list";
import { ResponsiveTabs } from "~/components/ui/responsive-tabs";
import { PoolAnalyticsWrapper } from "./pool-analytics-client";
import { type RouterOutputs } from "~/lib/trpc";

interface PoolTabsProps {
  pool: SwapPool;
  isOwner?: boolean;
  metadata: RouterOutputs["pool"]["get"];
}

export function PoolTabs({ pool, isOwner, metadata }: PoolTabsProps) {
  const [activeTab, setActiveTab] = useState("reports");

  const tabOptions = [
    {
      value: "reports",
      label: "Reports",
      icon: Icons.reports,
      description: "View activity reports",
      content: (
        <ReportList
          query={{
            vouchers: pool.vouchers,
          }}
        />
      ),
    },
    {
      value: "vouchers",
      label: "Vouchers",
      icon: Icons.vouchers,
      description: "Browse pool vouchers",
      content: (
        <div className="grid grid-cols-1 w-full overflow-hidden">
          <PoolVoucherTable pool={pool} metadata={metadata} />
        </div>
      ),
    },
    {
      value: "offers",
      label: "Offers",
      icon: PackageIcon,
      description: "Browse pool offers",
      content: (
        <div className="grid grid-cols-1 w-full overflow-hidden">
          <PoolProductsList pool={pool} />
        </div>
      ),
    },
    {
      value: "transactions",
      label: "Transactions",
      icon: ArrowLeftRightIcon,
      description: "Transaction history",
      content: (
        <div className="grid grid-cols-1 w-full overflow-hidden">
          <PoolTransactionsTable pool={pool} />
        </div>
      ),
    },
    {
      value: "info",
      label: "Analytics",
      icon: BarChart3Icon,
      description: "Pool analytics & data",
      content: (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Pool Analytics
            </h2>
            <PoolDetails address={pool.address} />
          </div>
          <div>
            <PoolAnalyticsWrapper pool={pool} />
          </div>
        </div>
      ),
    },
    {
      value: "edit",
      label: "Settings",
      icon: SettingsIcon,
      description: "Configure pool settings",
      authorization: {
        resource: "Pools" as const,
        action: "UPDATE" as const,
        isOwner,
      },
      content: (
        <>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Edit Pool
          </h2>
          <UpdatePoolForm initialValues={metadata!} />
        </>
      ),
    },
  ];

  return (
    <ResponsiveTabs
      tabs={tabOptions}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabTriggerClassName="px-6 py-2 text-sm font-medium border-b-2 rounded-none transition-colors"
    />
  );
}
