"use client";

import { useState } from "react";
import { SettingsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Authorization } from "~/hooks/useAuth";
import { ReportList } from "~/components/reports/report-list";
import { PoolVoucherTable } from "~/components/pools/tables/pool-voucher-table";
import { PoolTransactionsTable } from "~/components/pools/tables/pool-transactions-table";
import { PoolDetails } from "~/components/pools/pool-details";
import { UpdatePoolForm } from "~/components/pools/forms/update-pool-form";
import { type SwapPool } from "~/components/pools/types";
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

export function PoolTabs({ pool, poolAddress, isOwner, poolData }: PoolTabsProps) {
  const [activeTab, setActiveTab] = useState("reports");

  const tabOptions = [
    { value: "reports", label: "Reports" },
    { value: "vouchers", label: "Vouchers" },
    { value: "transactions", label: "Transactions" },
    { value: "info", label: "Analytics" },
  ];

  const settingsTab = { value: "edit", label: "Settings" };
  const showSettings = isOwner;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="border-b border-gray-200 bg-white rounded-t-2xl">
        {/* Desktop Tabs */}
        <TabsList className="hidden md:flex w-full justify-start bg-transparent border-none rounded-none h-auto p-0">
          <TabsTrigger
            value="reports"
            className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent rounded-none hover:text-blue-600 transition-colors"
          >
            Reports
          </TabsTrigger>
          <TabsTrigger
            value="vouchers"
            className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent rounded-none hover:text-blue-600 transition-colors"
          >
            Vouchers
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent rounded-none hover:text-blue-600 transition-colors"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent rounded-none hover:text-blue-600 transition-colors"
          >
            Analytics
          </TabsTrigger>
          <Authorization
            resource={"Pools"}
            action="UPDATE"
            isOwner={isOwner}
          >
            <TabsTrigger
              value="edit"
              className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent rounded-none hover:text-blue-600 transition-colors"
            >
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </Authorization>
        </TabsList>

        {/* Mobile Dropdown */}
        <div className="md:hidden p-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {activeTab === "edit" ? settingsTab.label : tabOptions.find(tab => tab.value === activeTab)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tabOptions.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label}
                </SelectItem>
              ))}
              {showSettings && (
                <SelectItem value={settingsTab.value}>
                  <div className="flex items-center">
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    {settingsTab.label}
                  </div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-lg">
        <TabsContent value="vouchers" className="p-0 m-0">
          <div className="p-6">
            <PoolVoucherTable pool={pool} />
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="p-0 m-0">
          <div className="p-6">
            <PoolTransactionsTable pool={pool} />
          </div>
        </TabsContent>

        <TabsContent value="reports" className="p-0 m-0">
          <div className="p-6">
            <ReportList
              query={{
                vouchers: pool.vouchers,
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="info" className="p-0 m-0">
          <div className="p-6 space-y-8">
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
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Edit Pool
            </h2>
            <UpdatePoolForm
              address={poolAddress}
              poolDescription={poolData?.swap_pool_description}
              bannerUrl={poolData?.banner_url}
              poolTags={poolData?.tags}
            />
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}