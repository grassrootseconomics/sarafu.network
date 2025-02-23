"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, InfoIcon } from "lucide-react";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type Payload } from "recharts/types/component/DefaultLegendContent";
import { FormattedValue, Symbol } from "~/contracts/react";
import { trpc } from "~/lib/trpc";
import { type TokenDetails } from "~/server/api/models/token";
import { BasicTable } from "../tables/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip as UITooltip,
} from "../ui/tooltip";
import { type SwapPool } from "./types";

const CHART_COLORS = {
  deposit: "#8884d8",
  swapIn: "#82ca9d",
  swapOut: "#ffc658",
};

export function PoolCharts(props: { pool?: SwapPool; dateRange: DateRange }) {
  const { pool, dateRange } = props;
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);

  if (!dateRange.from || !dateRange.to) return null;

  const { data: distributionData, isLoading: isDistributionLoading } =
    trpc.pool.tokenDistribution.useQuery(
      {
        address: pool?.address ?? "",
        from: dateRange.from,
        to: dateRange.to,
      },
      {
        enabled: !!pool?.address && !!dateRange.from && !!dateRange.to,
      }
    );

  const { data: swapPairsData, isLoading: isSwapPairsLoading } =
    trpc.pool.swapPairsData.useQuery(
      {
        poolAddress: pool?.address ?? "",
      },
      {
        enabled: !!pool?.address,
      }
    );

  function handleLegendClick(entry: Payload) {
    setHiddenSeries((prev) =>
      prev.includes(entry.dataKey as string)
        ? prev.filter((key) => key !== entry.dataKey)
        : [...prev, entry.dataKey as string]
    );
  }

  const distributionColumns: ColumnDef<TokenDistributionData>[] = [
    {
      id: "symbol",
      header: "Token",
      accessorKey: "symbol",
      cell: (info) => info.getValue() || "—",
    },
    {
      id: "depositValue",
      header: "Deposit Value",
      accessorKey: "deposit_value",
      cell: (info) => info.getValue() || "0",
    },
    {
      id: "swapInValue",
      header: "Swap In Value",
      accessorKey: "swap_in_value",
      cell: (info) => info.getValue() || "0",
    },
    {
      id: "swapOutValue",
      header: "Swap Out Value",
      accessorKey: "swap_out_value",
      cell: (info) => info.getValue() || "0",
    },
  ];

  const swapPairsColumns: ColumnDef<SwapPairData>[] = [
    {
      id: "tokenIn",
      header: "Token In",
      accessorFn: (row) => row.token_in_address,
      cell: ({ row }) => <Symbol address={row.original.token_in_address} />,
    },
    {
      id: "tokenOut",
      header: "Token Out",
      accessorFn: (row) => row.token_out_address,
      cell: ({ row }) => <Symbol address={row.original.token_out_address} />,
    },
    {
      id: "swapCount",
      header: () => (
        <div className="flex items-center gap-1">
          Swap Count
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Total number of swaps between these tokens
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      ),
      accessorFn: (row) => row.swap_count,
      cell: ({ row }) => (
        <div className="font-medium">{row.original.swap_count}</div>
      ),
    },
    {
      id: "totalInValue",
      header: "Total In Value",
      accessorFn: (row) => row.total_in_value,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-green-600">
          <ArrowDownIcon className="h-4 w-4" />
          <FormattedValue
            address={row.original.token_in_address}
            value={row.original.total_in_value}
          />
        </div>
      ),
    },
    {
      id: "totalOutValue",
      header: "Total Out Value",
      accessorFn: (row) => row.total_out_value,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-red-600">
          <ArrowUpIcon className="h-4 w-4" />
          <FormattedValue
            address={row.original.token_out_address}
            value={row.original.total_out_value}
          />
        </div>
      ),
    },
    {
      id: "totalFees",
      header: () => (
        <div className="flex items-center gap-1">
          Total Fees
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Total fees collected from swaps</TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      ),
      accessorFn: (row) => row.total_fees,
      cell: ({ row }) => (
        <FormattedValue
          address={row.original.token_out_address}
          value={row.original.total_fees}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Token Distribution
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Distribution of tokens in the pool over time
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isDistributionLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={distributionData?.map((d) => ({
                  ...d,
                  name: d.symbol,
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend onClick={handleLegendClick} />
                <Bar
                  dataKey="deposit_value"
                  stackId="a"
                  fill={CHART_COLORS.deposit}
                  name="Deposit"
                  hide={hiddenSeries.includes("deposit_value")}
                />
                <Bar
                  dataKey="swap_in_value"
                  stackId="a"
                  fill={CHART_COLORS.swapIn}
                  name="Swap In"
                  hide={hiddenSeries.includes("swap_in_value")}
                />
                <Bar
                  dataKey="swap_out_value"
                  stackId="a"
                  fill={CHART_COLORS.swapOut}
                  name="Swap Out"
                  hide={hiddenSeries.includes("swap_out_value")}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Distribution Data
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Detailed breakdown of token distribution
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isDistributionLoading ? (
            <div className="p-6">
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : (
            <BasicTable
              className="max-h-[300px]"
              data={distributionData ?? []}
              columns={distributionColumns}
              downloadFileName={`token-distribution-${dateRange.from?.toISOString().split("T")[0]}-to-${dateRange.to?.toISOString().split("T")[0]}.csv`}
              enableDownload
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Swap Pairs Analysis
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Analysis of token swap pairs and their performance
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isSwapPairsLoading ? (
            <div className="p-6">
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : (
            <BasicTable<SwapPairData>
              className="max-h-[300px]"
              data={swapPairsData ?? []}
              columns={swapPairsColumns}
              downloadFileName={`swap-pairs-${pool?.address}-${dateRange.from?.toISOString().split("T")[0]}-to-${dateRange.to?.toISOString().split("T")[0]}.csv`}
              enableDownload
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Types
interface TokenDistributionData {
  address: string;
  deposit_value: string;
  swap_in_value: string;
  swap_out_value: string;
  name?: string;
  symbol?: string;
  decimals?: number;
}

export interface SwapPairData {
  token_in_address: `0x${string}`;
  token_out_address: `0x${string}`;
  swap_count: number;
  total_in_value: string;
  token_in_details?: TokenDetails;
  total_out_value: string;
  token_out_details?: TokenDetails;
  total_fees: string;
  average_in_value: string;
  average_out_value: string;
}
