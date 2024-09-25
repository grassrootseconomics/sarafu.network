"use client";

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
import { type SwapPool } from "./types";
import { trpc } from "~/lib/trpc";
export const PoolCharts = ({
  pool,
  dateRange,
}: {
  pool: SwapPool | undefined;
  dateRange: DateRange;
}) => {
  const { data: distributionData } = trpc.pool.tokenDistribution.useQuery(
    {
      address: pool!.address,
      from: dateRange.from!,
      to: dateRange.to!,
    },
    {
      enabled: !!pool?.address && !!dateRange.from && !!dateRange.to,
    }
  );

  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);
  const handleLegendClick = (entry: Payload) => {
    setHiddenSeries((prev) =>
      prev.includes(entry.dataKey as string)
        ? prev.filter((key) => key !== entry.dataKey)
        : [...prev, entry.dataKey as string]
    );
  };

  return (
    <div>
      {/* Token Distribution */}
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
    </div>
  );
};
