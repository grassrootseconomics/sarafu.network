import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  HomeIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { Icons } from "~/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Authorization } from "~/hooks/useAuth";

interface VoucherTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  isOwner: boolean;
  children: React.ReactNode;
}

export function VoucherTabs({
  activeTab,
  onTabChange,
  isOwner,
  children,
}: VoucherTabsProps) {
  const tabOptions = [
    { value: "home", label: "Home", icon: HomeIcon },
    { value: "pools", label: "Pools", icon: Icons.pools },
    { value: "reports", label: "Reports", icon: Icons.reports },
    { value: "data", label: "Analytics", icon: BarChart3Icon },
    { value: "transactions", label: "Transactions", icon: ArrowLeftRightIcon },
    { value: "holders", label: "Holders", icon: UsersIcon },
  ];

  const settingsTab = { value: "update", label: "Settings" };

  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <div className="border-b overflow-hidden border-gray-200 bg-white rounded-2xl">
          {/* Desktop Tabs */}
          <TabsList className="hidden md:flex w-full justify-start bg-transparent border-none rounded-none h-auto p-0">
            <TabsTrigger
              value="home"
              className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-600 bg-transparent rounded-none hover:text-green-600 transition-colors"
            >
              Home
            </TabsTrigger>
            <TabsTrigger
              value="pools"
              className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-600 bg-transparent rounded-none hover:text-green-600 transition-colors"
            >
              Pools
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-600 bg-transparent rounded-none hover:text-green-600 transition-colors"
            >
              Reports
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-600 bg-transparent rounded-none hover:text-green-600 transition-colors"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-600 bg-transparent rounded-none hover:text-green-600 transition-colors"
            >
              Transactions
            </TabsTrigger>
            <TabsTrigger
              value="holders"
              className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-600 bg-transparent rounded-none hover:text-green-600 transition-colors"
            >
              Holders
            </TabsTrigger>

            <Authorization
              resource={"Vouchers"}
              action="UPDATE"
              isOwner={isOwner}
            >
              <TabsTrigger
                value="update"
                className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-600 bg-transparent rounded-none hover:text-green-600 transition-colors"
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </Authorization>
          </TabsList>

          {/* Mobile Dropdown */}
          <div className="md:hidden">
            <Select value={activeTab} onValueChange={onTabChange}>
              <SelectTrigger className="w-full h-14 bg-gradient-to-r from-green-50 to-emerald-100 border-green-200 hover:from-green-100 hover:to-emerald-150 focus:ring-2 focus:ring-green-300 focus:ring-offset-1 transition-all duration-200 shadow-sm">
                <SelectValue>
                  <div className="flex items-center gap-3">
                    {activeTab === "update" ? (
                      <>
                        <div className="flex items-center justify-center w-8 h-8 bg-green-200 rounded-full">
                          <SettingsIcon className="h-4 w-4 text-green-700" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-green-900 text-sm">
                            {settingsTab.label}
                          </span>
                          <span className="text-xs text-green-600">
                            Configure voucher settings
                          </span>
                        </div>
                      </>
                    ) : (
                      (() => {
                        const currentTab = tabOptions.find(
                          (tab) => tab.value === activeTab
                        );
                        const IconComponent = currentTab?.icon;
                        const descriptions = {
                          home: "Overview and products",
                          pools: "Pool memberships",
                          reports: "Activity reports",
                          data: "Analytics and insights",
                          transactions: "Transaction history",
                          holders: "Token holders",
                        };
                        return (
                          <>
                            <div className="flex items-center justify-center w-8 h-8 bg-green-200 rounded-full">
                              {IconComponent && (
                                <IconComponent className="h-4 w-4 text-green-700" />
                              )}
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-semibold text-green-900 text-sm">
                                {currentTab?.label}
                              </span>
                              <span className="text-xs text-green-600">
                                {
                                  descriptions[
                                    currentTab?.value as keyof typeof descriptions
                                  ]
                                }
                              </span>
                            </div>
                          </>
                        );
                      })()
                    )}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-full max-w-sm border-green-100 shadow-lg">
                {tabOptions.map((tab, index) => {
                  const IconComponent = tab.icon;
                  const descriptions = {
                    home: "Overview and products",
                    pools: "Pool memberships",
                    reports: "Activity reports",
                    data: "Analytics and insights",
                    transactions: "Transaction history",
                    holders: "Token holders",
                  };
                  return (
                    <SelectItem
                      key={tab.value}
                      value={tab.value}
                      className={`py-4 px-3 hover:bg-green-50 focus:bg-green-50 transition-colors duration-150 ${
                        index > 0 ? "border-t border-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full flex-shrink-0">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-semibold text-gray-900 text-sm">
                            {tab.label}
                          </span>
                          <span className="text-xs text-gray-500 leading-tight">
                            {
                              descriptions[
                                tab.value as keyof typeof descriptions
                              ]
                            }
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
                <Authorization
                  resource={"Vouchers"}
                  action="UPDATE"
                  isOwner={isOwner}
                >
                  <SelectItem
                    value={settingsTab.value}
                    className="py-4 px-3 border-t-2 border-gray-200 hover:bg-green-50 focus:bg-green-50 transition-colors duration-150"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full flex-shrink-0">
                        <SettingsIcon className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-semibold text-gray-900 text-sm">
                          {settingsTab.label}
                        </span>
                        <span className="text-xs text-gray-500 leading-tight">
                          Configure voucher settings
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                </Authorization>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-transparent mt-8">{children}</div>
      </Tabs>
    </div>
  );
}
