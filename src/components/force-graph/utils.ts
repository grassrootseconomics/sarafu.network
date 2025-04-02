import { extent } from "d3-array";
import { scaleSqrt } from "d3-scale";
import { erc20Abi } from "viem";
import { publicClient } from "~/config/viem.config.server";
import { type RouterOutput } from "~/server/api/root";
import { toUserUnits } from "~/utils/units";
import { type GraphData, type Link, type Node } from "./types";

// Function to fetch the balance for a given Ethereum address
/**
 * Fetches the balance of a given address for a specific voucher.
 * @param address The address to fetch the balance for.
 * @param voucherAddress The address of the voucher.
 * @returns The balance of the address for the voucher.
 */
export async function fetchBalance(
  address: `0x${string}`,
  voucherAddress: `0x${string}`
) {
  try {
    const data = await publicClient?.readContract({
      address: voucherAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });
    return data;
  } catch (error) {
    console.error("Error fetching balance:", error);
    return 0n;
  }
}

// Function to process transaction data into graph data
/**
 * Processes the graph data by populating nodes and creating links based on transaction data.
 * @param transactionData The transaction data used to populate the graph.
 * @param voucherAddress The voucher address used to fetch balances for each node.
 * @returns A promise that resolves to the processed graph data.
 */
export async function processGraphData(
  transactionData: RouterOutput["transaction"]["list"]["transactions"],
  voucherAddress: `0x${string}`
): Promise<GraphData> {
  const nodesMap = new Map<`0x${string}`, Node>();

  // Populate nodesMap with unique addresses from transactions
  transactionData.forEach((tx) => {
    [tx.from_address, tx.to_address].forEach((address) => {
      if (!nodesMap.has(address as `0x${string}`)) {
        nodesMap.set(address as `0x${string}`, {
          id: address as `0x${string}`,
          value: 0, // Initial value, to be updated with balance
          valueActual: 0, // Initial actual value, to be updated later
        });
      }
    });
  });

  // Fetch balances for each node and update the node values
  const balancePromises = Array.from(nodesMap.values()).map(async (node) => {
    const balance = await fetchBalance(node.id, voucherAddress);
    return {
      ...node,
      value: Number(balance),
      valueActual: toUserUnits(balance, 6),
    }; // Update node with balance
  });

  // Resolve all balance promises
  const nodesWithBalances = await Promise.all(balancePromises);
  nodesWithBalances.forEach((node) => {
    nodesMap.set(node.id, node); // Update the map with new values
  });

  // Scale node values if required
  const nodeValues = nodesWithBalances.map((node) => node.value);
  const [minValue, maxValue] = extent(nodeValues) as [number, number];
  const valueScale = scaleSqrt().domain([minValue, maxValue]).range([1, 100]);

  const scaledNodes = nodesWithBalances.map((node) => ({
    ...node,
    value: valueScale(node.value), // Apply scaling to node value
  }));

  // Create links from transaction data
  const links: Link[] = transactionData.map((tx) => ({
    source: scaledNodes.find((node) => node.id === tx.from_address) as Node,
    target: scaledNodes.find((node) => node.id === tx.to_address) as Node,
    voucher_address: tx.voucher_address as `0x${string}`,
  }));
  return {
    nodes: scaledNodes,
    links,
  };
}
