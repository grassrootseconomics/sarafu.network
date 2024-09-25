"use client";

import { useEffect, useState } from "react";
import { type GraphData } from "../types";
import { processGraphData } from "../utils";
import { trpc } from "~/lib/trpc";

/**
 * Custom hook to fetch and manage graph data for the force graph component.
 *
 * @param voucherAddress The address of the voucher.
 * @returns The graph data for the force graph.
 */
export function useGraphData(voucherAddress: `0x${string}`) {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const { data } = trpc.transaction.list.useQuery(
    { voucherAddress, limit: 10000 },
    { refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (!data) return;

    processGraphData(data.transactions, voucherAddress)
      .then(({ nodes, links }) => {
        setGraphData({ nodes, links });
      })
      .catch(console.error);
  }, [data, voucherAddress]);

  return graphData;
}
