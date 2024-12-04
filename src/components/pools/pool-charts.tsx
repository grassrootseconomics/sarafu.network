"use client";

import { type ColumnDef } from "@tanstack/react-table";
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
import { type SwapPool } from "./types";

export function PoolCharts(props: { pool?: SwapPool; dateRange: DateRange }) {
  const { pool, dateRange } = props;
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);

  if (!dateRange.from || !dateRange.to) return null;

  const { data: distributionData } = trpc.pool.tokenDistribution.useQuery(
    {
      address: pool?.address ?? "",
      from: dateRange.from,
      to: dateRange.to,
    },
    {
      enabled: !!pool?.address && !!dateRange.from && !!dateRange.to,
    }
  );

  const { data: swapPairsData } = trpc.pool.swapPairsData.useQuery(
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
      header: "Token",
      accessorKey: "symbol",
    },
    {
      header: "Deposit Value",
      accessorKey: "deposit_value",
    },
    {
      header: "Swap In Value",
      accessorKey: "swap_in_value",
    },
    {
      header: "Swap Out Value",
      accessorKey: "swap_out_value",
    },
  ];

  const swapPairsColumns: ColumnDef<SwapPairData>[] = [
    {
      header: "Token In",
      accessorFn: (row) => row.token_in_address,
      cell: ({ row }) => <Symbol address={row.original.token_in_address} />,
    },
    {
      header: "Token Out",
      accessorFn: (row) => row.token_out_address,
      cell: ({ row }) => <Symbol address={row.original.token_out_address} />,
    },
    {
      header: "Swap Count",
      accessorFn: (row) => row.swap_count,
    },
    {
      header: "Total In Value",
      accessorFn: (row) => row.total_in_value,
      cell: ({ row }) => (
        <FormattedValue
          address={row.original.token_in_address}
          value={row.original.total_in_value}
        />
      ),
    },
    {
      header: "Total Out Value",
      accessorFn: (row) => row.total_out_value,
      cell: ({ row }) => (
        <FormattedValue
          address={row.original.token_out_address}
          value={row.original.total_out_value}
        />
      ),
    },
    {
      header: "Total Fees",
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
    <div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Token Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={distributionData?.map((d) => ({
              ...d,
              name: d.symbol,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend onClick={handleLegendClick} />
            <Bar
              dataKey="deposit_value"
              stackId="a"
              fill="#8884d8"
              name="Deposit"
              hide={hiddenSeries.includes("deposit_value")}
            />
            <Bar
              dataKey="swap_in_value"
              stackId="a"
              fill="#82ca9d"
              name="Swap In"
              hide={hiddenSeries.includes("swap_in_value")}
            />
            <Bar
              dataKey="swap_out_value"
              stackId="a"
              fill="#ffc658"
              name="Swap Out"
              hide={hiddenSeries.includes("swap_out_value")}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {distributionData && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Distribution Data Table</h2>
          <BasicTable
            className="max-h-[300px]"
            data={distributionData}
            columns={distributionColumns}
          />
        </div>
      )}
      {swapPairsData && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Swap Pairs Data</h2>
          <BasicTable<SwapPairData>
            className="max-h-[300px]"
            data={swapPairsData}
            columns={swapPairsColumns}
          />
        </div>
      )}
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
