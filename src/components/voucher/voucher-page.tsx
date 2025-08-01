"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Card } from "~/components/ui/card";
import { toUserUnitsString } from "~/utils/units";

import { type UTCTimestamp } from "lightweight-charts";
import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  HomeIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToken } from "wagmi";
import StatisticsCard from "~/components/cards/statistics-card";
import { LineChart } from "~/components/charts/line-chart";
import { Icons } from "~/components/icons";
import { ContentContainer } from "~/components/layout/content-container";
import { useContractIndex, useSwapPool } from "~/components/pools/hooks";
import { ProductList } from "~/components/products/product-list";
import { TransactionsTable } from "~/components/tables/transactions-table";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import VoucherForm from "~/components/voucher/forms/voucher-form";
import { BasicVoucherFunctions } from "~/components/voucher/voucher-contract-functions";
import { VoucherHoldersTable } from "~/components/voucher/voucher-holders-table";
import { VoucherInfo } from "~/components/voucher/voucher-info";
import { env } from "~/env";
import { Authorization } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useIsContractOwner } from "~/hooks/useIsOwner";
import { trpc } from "~/lib/trpc";
import { type VoucherDetails } from "../pools/contract-functions";
import { ReportList } from "../reports/report-list";
import { ReportsByTagStats } from "../reports/reports-by-tag-stats";
import { VoucherChip } from "./voucher-chip";
import { VoucherTypeTag } from "./voucher-type-tag";
const LocationMap = dynamic(() => import("~/components/map/location-map"), {
  ssr: false,
});

const VoucherForceGraph = dynamic(
  () =>
    import("~/components/force-graph/voucher-force-graph").then(
      (mod) => mod.VoucherForceGraph
    ),
  {
    ssr: false,
  }
);

const from = new Date(new Date().setMonth(new Date().getMonth() - 1));
const to = new Date();

const VoucherPage = ({
  address,
  details,
}: {
  address: `0x${string}`;
  details: VoucherDetails;
}) => {
  const voucher_address = address;
  const { data: poolsRegistry } = useContractIndex(
    env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS
  );
  const isOwner = useIsContractOwner(voucher_address);
  const isMounted = useIsMounted();
  const { data: voucher } = trpc.voucher.byAddress.useQuery(
    { voucherAddress: voucher_address },
    {
      enabled: !!voucher_address,
      staleTime: 60_000,
    }
  );
  const { data: token } = useToken({
    address: voucher_address,
    query: {
      staleTime: 60_000,
      enabled: !!voucher_address,
    },
  });
  const { data: txsPerDay } = trpc.stats.txsPerDay.useQuery({
    voucherAddress: voucher_address,
  });
  const { data: volumnPerDay } = trpc.stats.voucherVolumePerDay.useQuery({
    voucherAddress: voucher_address,
  });

  const { data: stats } = trpc.stats.voucherStats.useQuery({
    voucherAddress: voucher_address,
    dateRange: {
      from: from,
      to: to,
    },
  });
  const [activeTab, setActiveTab] = useState("home");

  const tabOptions = [
    { value: "home", label: "Home", icon: HomeIcon },
    { value: "pools", label: "Pools", icon: Icons.pools },
    { value: "reports", label: "Reports", icon: Icons.reports },
    { value: "data", label: "Analytics", icon: BarChart3Icon },
    { value: "transactions", label: "Transactions", icon: ArrowLeftRightIcon },
    { value: "holders", label: "Holders", icon: UsersIcon },
  ];

  const settingsTab = { value: "update", label: "Settings" };
  const showSettings = isOwner;

  return (
    <ContentContainer
      title={details?.name ?? "Voucher Details"}
      className="bg-transparent"
    >
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        {/* Banner Background */}
        {voucher?.banner_url ? (
          <div className="absolute inset-0">
            <Image
              src={voucher.banner_url}
              alt="Voucher banner"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800" />
        )}

        {/* Content Overlay */}
        <div className="relative z-10 px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <div className="max-w-4xl">
            <div className="space-y-6">
              {/* Voucher Icon and Name */}
              <div className="flex items-center gap-6">
                <Avatar className="size-20 sm:size-24 shadow-xl ring-4 ring-white/20">
                  <AvatarImage
                    asChild
                    src={voucher?.icon_url ?? "/apple-touch-icon.png"}
                  >
                    <Image
                      src={voucher?.icon_url ?? "/apple-touch-icon.png"}
                      alt=""
                      width={96}
                      height={96}
                    />
                  </AvatarImage>
                  <AvatarFallback>
                    {details?.name?.substring(0, 2).toLocaleUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    {details?.name}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xl sm:text-2xl text-white/90">
                      {details?.symbol}
                    </p>
                    {voucher?.voucher_type && (
                      <VoucherTypeTag
                        type={voucher?.voucher_type}
                        address={voucher_address}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Voucher Value */}
              {voucher?.voucher_value && voucher?.voucher_uoa && (
                <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20">
                  <p className="font-semibold text-white">
                    1 {details?.symbol} = {voucher.voucher_value}{" "}
                    {voucher.voucher_uoa} of Products
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4">
                <BasicVoucherFunctions
                  voucher_address={voucher_address}
                  voucher={voucher}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl" />
      </div>
      {/* Modern Tabs Section */}
      <div className="mt-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              <Select value={activeTab} onValueChange={setActiveTab}>
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
                  {showSettings && (
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
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className=" bg-transparent mt-8 ">
            <TabsContent value="home" className="p-0 m-0">
              <div className="max-w-4xl mx-auto space-y-6">
                {voucher?.voucher_description && (
                  <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/30">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-3">
                        <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                        About this Voucher
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
                        {voucher?.voucher_description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-blue-50/20">
                  <CardContent className="p-6">
                    <ProductList
                      isOwner={isOwner}
                      voucher_id={voucher?.id ?? 0}
                      voucherSymbol={details?.symbol ?? ""}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pools" className="p-0 m-0">
              <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-purple-50/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                    Pool Memberships
                  </CardTitle>
                  <p className="text-gray-600 text-sm mt-2">
                    This voucher participates in the following liquidity pools
                  </p>
                </CardHeader>
                <CardContent>
                  {poolsRegistry?.contractAddresses?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-4 text-gray-500 py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icons.pools className="w-10 h-10 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium text-gray-600">
                          No Pool Memberships
                        </p>
                        <p className="text-sm text-gray-400 mt-1 max-w-md">
                          This voucher isn&apos;t part of any liquidity pools
                          yet. Pool memberships enable token swapping and
                          provide liquidity for trading.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {poolsRegistry?.contractAddresses?.map((address) => (
                        <VoucherPoolListItem
                          key={address}
                          poolAddress={address}
                          voucherAddress={voucher_address}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="p-0 m-0">
              <ReportList
                query={{
                  vouchers: [voucher_address],
                }}
              />
            </TabsContent>
            <TabsContent value="data" className="p-0 m-0">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                    Voucher Analytics
                  </h2>
                  <div className="grid w-fill gap-2 md:gap-4 grid-cols-2 md:grid-cols-4 items-center">
                    <StatisticsCard
                      value={stats?.transactions.total.toString() || "0"}
                      title="Transactions"
                      Icon={Icons.hash}
                      delta={stats?.transactions.delta || 0}
                      isIncrease={(stats?.transactions.delta || 0) > 0}
                    />
                    <StatisticsCard
                      value={stats?.accounts.total.toString() || "0"}
                      title="Active Users"
                      Icon={Icons.person}
                      delta={stats?.accounts.delta || 0}
                      isIncrease={(stats?.accounts.delta || 0) > 0}
                    />
                    <StatisticsCard
                      value={
                        isMounted
                          ? toUserUnitsString(
                              token?.totalSupply.value,
                              details?.decimals
                            )
                          : "0"
                      }
                      title="Total Supply"
                      Icon={Icons.hash}
                      delta={0}
                      isIncrease={false}
                    />
                    <StatisticsCard
                      value={toUserUnitsString(
                        stats?.volume.total || BigInt(0),
                        details?.decimals
                      )}
                      title="Volume"
                      Icon={Icons.hash}
                      delta={parseFloat(
                        toUserUnitsString(
                          BigInt(stats?.volume.delta || 0),
                          details?.decimals
                        )
                      )}
                      isIncrease={(stats?.volume.delta || 0) > 0}
                    />
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                  <div className="col-span-1">
                    <Card>
                      <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle className="text-2xl">Information</CardTitle>
                      </CardHeader>
                      <CardContent className="pl-6">
                        {voucher && (
                          <VoucherInfo token={token} voucher={voucher} />
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Tabs defaultValue="network" className="col-span-1">
                    <TabsList>
                      <TabsTrigger value="network">Network</TabsTrigger>
                      <TabsTrigger value="transactions">
                        Transactions
                      </TabsTrigger>
                      <TabsTrigger value="volume">Volume</TabsTrigger>
                      <TabsTrigger value="map">Map</TabsTrigger>
                    </TabsList>
                    <Card className="overflow-hidden mt-4">
                      <CardContent className="p-0">
                        <TabsContent value="transactions" className="mt-0">
                          <LineChart
                            data={
                              txsPerDay?.map((v) => ({
                                time: (new Date(v.x).getTime() /
                                  1000) as UTCTimestamp,
                                value: parseInt(v.y.toString()),
                              })) || []
                            }
                          />
                        </TabsContent>
                        <TabsContent value="volume" className="mt-0">
                          <LineChart
                            data={
                              volumnPerDay?.map((v) => ({
                                time: (v.x.getTime() / 1000) as UTCTimestamp,
                                value: parseInt(toUserUnitsString(BigInt(v.y))),
                              })) || []
                            }
                          />
                        </TabsContent>
                        <TabsContent value="map" className="mt-0">
                          <LocationMap
                            style={{
                              height: "350px",
                              width: "100%",
                              zIndex: 1,
                            }}
                            marker={
                              <VoucherChip voucher_address={voucher_address} />
                            }
                            value={
                              voucher?.geo
                                ? {
                                    latitude: voucher.geo?.x,
                                    longitude: voucher.geo?.y,
                                  }
                                : undefined
                            }
                          />
                        </TabsContent>
                        <TabsContent value="network" className="mt-0">
                          <div style={{ height: "350px", width: "100%" }}>
                            <VoucherForceGraph
                              voucherAddress={voucher_address}
                            />
                          </div>
                        </TabsContent>
                      </CardContent>
                    </Card>
                  </Tabs>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-2xl font-semibold">Reports by Tag</h2>
                  </div>
                  <ReportsByTagStats
                    dateRange={{ from, to }}
                    vouchers={[voucher_address]}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="p-0 m-0 bg-white">
              <div className="grid grid-cols-1 w-full overflow-hidden">
                <TransactionsTable voucherAddress={voucher_address} />
              </div>
            </TabsContent>

            <TabsContent value="holders" className="p-0 m-0 bg-white">
              <div className="grid grid-cols-1 w-full overflow-hidden">
                <VoucherHoldersTable voucherAddress={voucher_address} />
              </div>
            </TabsContent>

            <TabsContent value="update" className="p-0 m-0">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                Update Voucher
              </h2>
              <VoucherForm
                voucherAddress={voucher_address}
                metadata={voucher}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ContentContainer>
  );
};

export default VoucherPage;

function VoucherPoolListItem(props: {
  poolAddress: `0x${string}`;
  voucherAddress: `0x${string}`;
}) {
  const { data: pool } = useSwapPool(props.poolAddress);
  if (!pool?.vouchers?.includes(props.voucherAddress)) return null;
  const details = pool?.voucherDetails?.find(
    (d) => d.address === props.voucherAddress
  );

  const balance = details?.poolBalance?.formattedNumber ?? 0;
  const limit = details?.limitOf?.formattedNumber ?? 0;
  const percentage = limit > 0 ? (balance / limit) * 100 : 0;

  return (
    <Link
      href={`/pools/${pool?.address}`}
      key={pool?.address}
      className="group block p-4 bg-white border border-gray-100 rounded-xl hover:border-purple-200 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-white hover:to-purple-50/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
            {pool?.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Pool Liquidity: {balance.toFixed(2)} / {limit.toFixed(2)} tokens
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <div className="w-16 h-16 relative">
            {/* Circular Progress */}
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${
                  2 * Math.PI * 28 * (1 - percentage / 100)
                }`}
                className="text-purple-500 transition-all duration-300"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">
                {percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
