"use client";

import { Activity, LayoutDashboard, Settings } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ResponsiveTabs } from "~/components/ui/responsive-tabs";
import { Icons } from "../icons";

export type ProfileTab =
  | "balances"
  | "activity"
  | "vouchers"
  | "pools"
  | "reports"
  | "settings";

interface ProfileTabsProps {
  /** Content for overview tab (stats + balances) */
  statsContent: React.ReactNode;
  balancesContent: React.ReactNode;
  /** Content for activity tab (transaction history) */
  transactionsContent: React.ReactNode;
  /** Content for assets tab (vouchers + pools) */
  vouchersContent: React.ReactNode;
  poolsContent: React.ReactNode;
  /** Optional reports content (shown in assets tab) */
  reportsContent?: React.ReactNode;
  /** Optional settings tab content (only shown for own profile) */
  settingsContent?: React.ReactNode;
  /** Default tab to show (defaults to 'overview') */
  defaultTab?: ProfileTab;
}

export function ProfileTabs({
  statsContent,
  transactionsContent,
  vouchersContent,
  balancesContent,
  poolsContent,
  reportsContent,
  settingsContent,
  defaultTab = "balances",
}: ProfileTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get initial tab from URL or use default
  const tabParam = searchParams.get("tab") as ProfileTab | null;
  const initialTab = isValidTab(tabParam) ? tabParam : defaultTab;

  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);

  // Sync tab state with URL query params
  useEffect(() => {
    const currentTab = searchParams.get("tab") as ProfileTab | null;
    if (currentTab && isValidTab(currentTab) && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams, activeTab]);

  const updateUrl = useCallback(
    (newTab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", newTab);
      window.history.replaceState({}, "", `${pathname}?${params.toString()}`);
    },
    [pathname, searchParams]
  );
  /**
   * Handle tab change and update URL
   */
  const handleTabChange = (value: string) => {
    const newTab = value as ProfileTab;
    setActiveTab(newTab);

    // Update URL with new tab parameter
    updateUrl(newTab);
  };

  const tabs = [
    {
      value: "balances",
      label: "Balances",
      icon: LayoutDashboard,
      description: "Overview of accounts balances",
      content: (
        <div className="space-y-6">
          {/* Balances Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Balances</h3>
            {balancesContent}
          </div>
        </div>
      ),
    },
    {
      value: "activity",
      label: "Activity",
      icon: Activity,
      description: "Transaction history and activity",
      content: (
        <div className="space-y-6">
          {/* Stats Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            {statsContent}
          </div>
          {/* Activity Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            {transactionsContent}
          </div>
        </div>
      ),
    },
    {
      value: "vouchers",
      label: "Vouchers",
      icon: Icons.vouchers,
      description: "Vouchers controlled by this account",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Vouchers</h3>
            {vouchersContent}
          </div>
        </div>
      ),
    },
    {
      value: "pools",
      label: "Pools",
      icon: Icons.pools,
      description: "Pools controlled by this account",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Pools</h3>
            {poolsContent}
          </div>
        </div>
      ),
    },
    {
      value: "reports",
      label: "Reports",
      icon: Icons.reports,
      description: "Reports created by this account",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Reports</h3>
            {reportsContent}
          </div>
        </div>
      ),
    },
  ];

  // Add settings tab if content is provided (own profile)
  if (settingsContent) {
    tabs.push({
      value: "settings",
      label: "Settings",
      icon: Settings,
      description: "Edit profile settings",
      content: <>{settingsContent}</>,
    });
  }

  return (
    <ResponsiveTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      defaultTab={defaultTab}
      contentClassName="p-0 sm:p-6 mt-4"
    />
  );
}

/**
 * Type guard to check if a string is a valid ProfileTab
 */
function isValidTab(tab: string | null): tab is ProfileTab {
  return (
    tab === "overview" ||
    tab === "activity" ||
    tab === "reports" ||
    tab === "vouchers" ||
    tab === "pools" ||
    tab === "settings"
  );
}
