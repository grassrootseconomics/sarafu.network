"use client";

import { ArrowLeftRight, Coins, FileText, Settings, Waves } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ResponsiveTabs } from "~/components/ui/responsive-tabs";

/**
 * Available tab options for profile navigation
 */
export type ProfileTab =
  | "transactions"
  | "vouchers"
  | "pools"
  | "reports"
  | "settings";

/**
 * Props for ProfileTabs component
 */
interface ProfileTabsProps {
  /** Content to display in transactions tab */
  transactionsContent: React.ReactNode;
  /** Content to display in vouchers tab */
  vouchersContent: React.ReactNode;
  /** Content to display in pools tab */
  poolsContent: React.ReactNode;
  /** Content to display in reports tab */
  reportsContent: React.ReactNode;
  /** Optional content to display in settings tab (only shown for own profile) */
  settingsContent?: React.ReactNode;
  /** Default tab to show (defaults to 'transactions') */
  defaultTab?: ProfileTab;
}

/**
 * Profile tabs component with URL query param synchronization
 *
 * Features:
 * - Responsive tabs with mobile drawer
 * - Transactions, Vouchers, Pools tabs (Settings for own profile)
 * - URL query param sync (e.g., ?tab=vouchers)
 * - Mobile-friendly drawer navigation with icons
 * - Active state styling
 * - Preserves other query parameters when switching tabs
 *
 * Uses ResponsiveTabs component for consistent mobile/desktop experience
 */
export function ProfileTabs({
  transactionsContent,
  vouchersContent,
  poolsContent,
  reportsContent,
  settingsContent,
  defaultTab = "transactions",
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

  // Build tabs array
  const tabs = [
    {
      value: "transactions",
      label: "Transactions",
      icon: ArrowLeftRight,
      description: "View transaction history",
      content: transactionsContent,
    },
    {
      value: "vouchers",
      label: "Vouchers",
      icon: Coins,
      description: "Vouchers owned by this user",
      content: vouchersContent,
    },
    {
      value: "pools",
      label: "Pools",
      icon: Waves,
      description: "Pools owned by this user",
      content: poolsContent,
    },
    {
      value: "reports",
      label: "Reports",
      icon: FileText,
      description: "Reports created by this user",
      content: reportsContent,
    },
  ];

  // Add settings tab if content is provided (own profile)
  if (settingsContent) {
    tabs.push({
      value: "settings",
      label: "Settings",
      icon: Settings,
      description: "Edit profile settings",
      content: settingsContent,
    });
  }

  return (
    <ResponsiveTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      defaultTab={defaultTab}
      containerClassName="border border-border bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm"
      tabsListClassName="hidden md:flex w-full justify-start border-none rounded-none h-auto p-2 gap-1 bg-transparent"
      tabTriggerClassName="px-6 py-3 text-sm font-medium rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all hover:bg-muted/50"
      contentClassName="p-6"
    />
  );
}

/**
 * Type guard to check if a string is a valid ProfileTab
 */
function isValidTab(tab: string | null): tab is ProfileTab {
  return (
    tab === "transactions" ||
    tab === "vouchers" ||
    tab === "pools" ||
    tab === "reports" ||
    tab === "settings"
  );
}
