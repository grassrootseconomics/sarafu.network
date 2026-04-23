"use client";

import { type DateRange } from "react-day-picker";
import ForceGraph2D from "react-force-graph-2d";
import { trpc } from "~/lib/trpc";
import { type SwapPool } from "./types";

export function TokenDistributionChart({
  pool,
  dateRange,
}: {
  pool: SwapPool | undefined;
  dateRange: DateRange;
}) {
  const { data: tokenDistribution } = trpc.pool.tokenDistribution.useQuery(
    {
      address: pool?.address ?? "",
      from: dateRange?.from as Date,
      to: dateRange?.to as Date,
    },
    {
      enabled: !!pool?.address && !!dateRange.from && !!dateRange.to,
    }
  );

  const graphData = {
    nodes:
      tokenDistribution?.map((token) => ({
        id: token.address,
        name: token.symbol ?? token.name ?? token.address,
        val: 1, // Node size
        color: token.address === pool?.address ? "#ff0000" : "#00ff00", // Pool is red, tokens are green
      })) ?? [],

    links:
      tokenDistribution?.flatMap((token) => [
        {
          source: token.address,
          target: pool?.address ?? "",
          value: Number(token.deposit_value),
          label: `Deposit: ${token.deposit_value}`,
        },
        {
          source: pool?.address ?? "",
          target: token.address,
          value: Number(token.swap_out_value),
          label: `Swap Out: ${token.swap_out_value}`,
        },
        {
          source: token.address,
          target: pool?.address ?? "",
          value: Number(token.swap_in_value),
          label: `Swap In: ${token.swap_in_value}`,
        },
      ]) ?? [],
  };

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeLabel="name"
      linkLabel="label"
      linkWidth={(link) => Math.sqrt(link.value) * 0.5}
      nodeVal={(node) => Number(node.value)}
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={0.7}
      width={800}
      height={600}
    />
  );
}
