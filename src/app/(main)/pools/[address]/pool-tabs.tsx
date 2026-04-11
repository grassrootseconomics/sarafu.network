"use client";

import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  FileCodeIcon,
  PackageIcon,
  SettingsIcon,
  WrenchIcon,
} from "lucide-react";
import { useState } from "react";
import { Icons } from "~/components/icons";
import { UpdatePoolForm } from "~/components/pools/forms/update-pool-form";
import { PoolContractsView } from "~/components/pools/pool-contracts-view";
import { PoolOffersGrid } from "~/components/pools/pool-offers-grid";
import { PoolOffersList } from "~/components/pools/pool-offers-list";
import { PoolTransactionsTable } from "~/components/pools/tables/pool-transactions-table";
import { PoolVoucherTable } from "~/components/pools/tables/pool-voucher-table";
import { type SwapPool } from "~/components/pools/types";
import { ReportList } from "~/components/reports/report-list";
import { ResponsiveTabs } from "~/components/ui/responsive-tabs";
import { type RouterOutputs } from "~/lib/trpc";
import { PoolAnalyticsWrapper } from "./pool-analytics-client";

interface PoolTabsProps {
  pool: SwapPool;
  isOwner?: boolean;
  metadata: RouterOutputs["pool"]["get"] | null;
}

export function PoolTabs({ pool, isOwner, metadata }: PoolTabsProps) {
  const [activeTab, setActiveTab] = useState("offers");

  const tabOptions = [
    {
      value: "offers",
      label: "Offers",
      icon: PackageIcon,
      description: "Browse pool offers",
      content: (
        <div className="grid grid-cols-1 w-full overflow-hidden">
          <PoolOffersGrid pool={pool} metadata={metadata} />
        </div>
      ),
    },
    {
      value: "vouchers",
      label: "Vouchers",
      icon: Icons.vouchers,
      description: "Browse pool vouchers and their offers",
      content: (
        <div className="grid grid-cols-1 w-full overflow-hidden">
          <PoolOffersList pool={pool} metadata={metadata} />
        </div>
      ),
    },
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
      content: <PoolAnalyticsWrapper pool={pool} />,
    },
    {
      value: "setup",
      label: "Setup",
      icon: WrenchIcon,
      description: "Manage pool voucher setup",
      content: (
        <div className="grid grid-cols-1 w-full overflow-hidden">
          <PoolVoucherTable pool={pool} metadata={metadata} />
        </div>
      ),
    },
    {
      value: "contracts",
      label: "Contracts",
      icon: FileCodeIcon,
      description: "View and manage pool contracts",
      content: <PoolContractsView address={pool.address} isOwner={isOwner} />,
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
          <UpdatePoolForm
            initialValues={
              metadata
                ? {
                    ...metadata,
                    pool_name: metadata.pool_name ?? pool.name,
                    tags: metadata.tags ?? [],
                  }
                : {
                    pool_address: pool.address,
                    pool_name: pool.name ?? "",
                    swap_pool_description: "",
                    banner_url: null,
                    tags: [],
                    unit_of_account: "USD",
                  }
            }
          />
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
