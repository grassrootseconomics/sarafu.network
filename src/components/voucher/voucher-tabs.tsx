import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  HomeIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { Icons } from "~/components/icons";
import { ResponsiveTabs } from "~/components/ui/responsive-tabs";

interface VoucherTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  isOwner: boolean | undefined;
  children: React.ReactNode;
}

export function VoucherTabs({
  activeTab,
  onTabChange,
  isOwner,
  children,
}: VoucherTabsProps) {
  const tabOptions = [
    {
      value: "home",
      label: "Home",
      icon: HomeIcon,
      description: "Overview and Offers",
    },
    {
      value: "pools",
      label: "Pools",
      icon: Icons.pools,
      description: "Pool memberships",
    },
    {
      value: "reports",
      label: "Reports",
      icon: Icons.reports,
      description: "Activity reports",
    },
    {
      value: "data",
      label: "Analytics",
      icon: BarChart3Icon,
      description: "Analytics and insights",
    },
    {
      value: "transactions",
      label: "Transactions",
      icon: ArrowLeftRightIcon,
      description: "Transaction history",
    },
    {
      value: "holders",
      label: "Holders",
      icon: UsersIcon,
      description: "Token holders",
    },
    {
      value: "update",
      label: "Settings",
      icon: SettingsIcon,
      description: "Configure voucher settings",
      authorization: {
        resource: "Vouchers" as const,
        action: "UPDATE" as const,
        isOwner,
      },
    },
  ];

  return (
    <div className="mt-8">
      <ResponsiveTabs
        tabs={tabOptions}
        activeTab={activeTab}
        onTabChange={onTabChange}
        containerClassName="border-b overflow-hidden border-gray-200 bg-white rounded-2xl"
        tabTriggerClassName="px-6 py-2 text-sm font-medium border-b-2 rounded-none transition-colors"
        drawerContentClassName="p-2"
        contentClassName="bg-transparent mt-8"
      >
        {children}
      </ResponsiveTabs>
    </div>
  );
}
