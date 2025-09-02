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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Authorization } from "~/hooks/useAuth";
import { PoolAnalyticsWrapper } from "./pool-analytics-client";

interface PoolTabsProps {
  pool: SwapPool;
  poolAddress: `0x${string}`;
  isOwner: boolean;
  poolData?: {
    swap_pool_description?: string;
    banner_url?: string | null;
    tags?: string[];
  } | null;
}

export function PoolTabs({
  pool,
  poolAddress,
  isOwner,
  poolData,
}: PoolTabsProps) {
  const [activeTab, setActiveTab] = useState("reports");

  const tabOptions = [
    { value: "reports", label: "Reports", icon: Icons.reports },
    { value: "vouchers", label: "Vouchers", icon: Icons.vouchers },
    { value: "products", label: "Products", icon: PackageIcon },
    { value: "transactions", label: "Transactions", icon: ArrowLeftRightIcon },
    { value: "info", label: "Analytics", icon: BarChart3Icon },
  ];

  const settingsTab = { value: "edit", label: "Settings" };
  const showSettings = isOwner;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="border-b border-gray-200 bg-white rounded-2xl overflow-hidden">
        {/* Desktop Tabs */}
        <TabsList className="hidden md:flex w-full justify-start border-none rounded-none h-auto p-0">
          <TabsTrigger
            value="reports"
            className="px-6 py-2 text-sm font-medium border-b-2 rounded-none transition-colors"
          >
            Reports
          </TabsTrigger>
          <TabsTrigger
            value="vouchers"
            className="px-6 py-2 text-sm font-medium"
          >
            Vouchers
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="px-6 py-2 text-sm font-medium"
          >
            Products
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="px-6 py-2 text-sm font-medium"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger value="info" className="px-6 py-2 text-sm font-medium">
            Analytics
          </TabsTrigger>
          <Authorization resource={"Pools"} action="UPDATE" isOwner={isOwner}>
            <TabsTrigger value="edit" className="px-6 py-2 text-sm font-medium">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </Authorization>
        </TabsList>

        {/* Mobile Dropdown */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full h-14">
              <SelectValue>
                <div className="flex items-center gap-3">
                  {activeTab === "edit" ? (
                    <>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full">
                        <SettingsIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-primary text-sm">
                          {settingsTab.label}
                        </span>
                        <span className="text-xs text-gray-600">
                          Configure pool settings
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
                        reports: "View activity reports",
                        vouchers: "Browse pool vouchers",
                        products: "Browse pool products",
                        transactions: "Transaction history",
                        info: "Pool analytics & data",
                      };
                      return (
                        <>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full">
                            {IconComponent && (
                              <IconComponent className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-semibold text-gray-900 text-sm">
                              {currentTab?.label}
                            </span>
                            <span className="text-xs text-gray-600">
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
            <SelectContent className="w-full max-w-sm border-gray-100 shadow-lg">
              {tabOptions.map((tab, index) => {
                const IconComponent = tab.icon;
                const descriptions = {
                  reports: "View activity reports",
                  vouchers: "Browse pool vouchers",
                  products: "Browse pool products",
                  transactions: "Transaction history",
                  info: "Pool analytics & data",
                };
                return (
                  <SelectItem
                    key={tab.value}
                    value={tab.value}
                    className={`py-4 px-3 hover:bg-gray-50 focus:bg-gray-50 transition-colors duration-150 ${
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
                          {descriptions[tab.value as keyof typeof descriptions]}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
              {showSettings && (
                <SelectItem
                  value={settingsTab.value}
                  className="py-4 px-3 border-t-2 border-gray-200 hover:bg-blue-50 focus:bg-blue-50 transition-colors duration-150"
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
                        Configure pool settings
                      </span>
                    </div>
                  </div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className=" mt-4">
        <TabsContent value="vouchers" className="p-0 m-0">
          <div className="grid grid-cols-1 w-full overflow-hidden">
            <PoolVoucherTable pool={pool} />
          </div>
        </TabsContent>

        <TabsContent value="products" className="p-0 m-0">
          <div className="grid grid-cols-1 w-full overflow-hidden">
            <PoolProductsList pool={pool} />
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="p-0 m-0">
          <div className="grid grid-cols-1 w-full overflow-hidden">
            <PoolTransactionsTable pool={pool} />
          </div>
        </TabsContent>

        <TabsContent value="reports" className="p-0 m-0">
          <ReportList
            query={{
              vouchers: pool.vouchers,
            }}
          />
        </TabsContent>

        <TabsContent value="info" className="p-0 m-0">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                Pool Analytics
              </h2>
              <PoolDetails address={poolAddress} />
            </div>
            <div>
              <PoolAnalyticsWrapper pool={pool} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="p-0 m-0">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Edit Pool
          </h2>
          <UpdatePoolForm
            address={poolAddress}
            poolDescription={poolData?.swap_pool_description}
            bannerUrl={poolData?.banner_url}
            poolTags={poolData?.tags}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
