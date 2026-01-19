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
  statsContent: React.ReactNode;
  balancesContent: React.ReactNode;
  transactionsContent: React.ReactNode;
  vouchersContent: React.ReactNode;
  poolsContent: React.ReactNode;
  reportsContent?: React.ReactNode;
  settingsContent?: React.ReactNode;
  defaultTab?: ProfileTab;
  /** Whether viewing own profile - changes tab labels to "My Vouchers", etc. */
  isOwnProfile?: boolean;
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
  isOwnProfile = false,
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
      description: "Overview of account balances",
      content: (
        <div className="space-y-8">
          {balancesContent}
        </div>
      ),
    },
    {
      value: "activity",
      label: "Activity",
      icon: Activity,
      description: "Transaction history and activity",
      content: (
        <div className="space-y-10 md:space-y-12">
          {/* Stats Section */}
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground mb-6">
              Statistics
            </h3>
            {statsContent}
          </div>
          {/* Activity Section */}
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground mb-6">
              Transactions
            </h3>
            {transactionsContent}
          </div>
        </div>
      ),
    },
    {
      value: "vouchers",
      label: isOwnProfile ? "My Vouchers" : "Vouchers",
      icon: Icons.vouchers,
      description: "Vouchers controlled by this account",
      content: (
        <div className="space-y-8">
          {vouchersContent}
        </div>
      ),
    },
    {
      value: "pools",
      label: isOwnProfile ? "My Pools" : "Pools",
      icon: Icons.pools,
      description: "Pools controlled by this account",
      content: (
        <div className="space-y-8">
          {poolsContent}
        </div>
      ),
    },
    {
      value: "reports",
      label: isOwnProfile ? "My Reports" : "Reports",
      icon: Icons.reports,
      description: "Reports created by this account",
      content: (
        <div className="space-y-8">
          {reportsContent}
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
      containerClassName="bg-transparent border-none rounded-none"
      tabsListClassName="hidden md:flex w-full justify-start gap-1 p-1.5 bg-muted/30 rounded-2xl backdrop-blur-sm border-none"
      tabTriggerClassName="px-6 py-2.5 text-sm font-medium rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300"
      contentClassName="p-0 sm:p-2 mt-8 md:mt-10"
    />
  );
}

/**
 * Type guard to check if a string is a valid ProfileTab
 */
function isValidTab(tab: string | null): tab is ProfileTab {
  return (
    tab === "balances" ||
    tab === "activity" ||
    tab === "reports" ||
    tab === "vouchers" ||
    tab === "pools" ||
    tab === "settings"
  );
}
