"use client";

import { keepPreviousData } from "@tanstack/query-core";
import { CheckCircleIcon, FilterIcon, XCircleIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { getAddress } from "viem";
import { ResponsiveModal } from "~/components/responsive-modal";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { VoucherChip } from "~/components/voucher/voucher-chip";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { celoscanUrl } from "~/utils/celo";
import Address from "../../address";
import { InfiniteTable } from "../../tables/infinite-table";
import { VoucherValue } from "../../voucher/voucher-name";
import { useSwapPool } from "../hooks";
import { type SwapPool } from "../types";
export const PoolTransactionsTable = (props: {
  pool: SwapPool | undefined;
}) => {
  const { data: pool } = useSwapPool(props.pool?.address, props.pool);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"swap" | "deposit" | "all">(
    "all"
  );
  const [inTokenFilter, setInTokenFilter] = useState<string | null>(null);
  const [outTokenFilter, setOutTokenFilter] = useState<string | null>(null);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== "all") count++;
    if (inTokenFilter) count++;
    if (outTokenFilter) count++;
    return count;
  }, [typeFilter, inTokenFilter, outTokenFilter]);

  const transactions = trpc.pool.transactions.useInfiniteQuery(
    {
      address: getAddress(pool!.address),
      type: typeFilter,
      inToken: inTokenFilter,
      outToken: outTokenFilter,
    },
    {
      enabled: !!pool?.address,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: false,
    }
  );

  const flatData = useMemo(
    () => transactions.data?.pages?.flatMap((page) => page.transactions) ?? [],
    [transactions.data]
  );

  const uniqueTokens = pool?.vouchers;
  const clearFilters = () => {
    setTypeFilter("all");
    setInTokenFilter(null);
    setOutTokenFilter(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl">Transaction History</h2>
        <ResponsiveModal
          title="Transaction Filters"
          button={
            <Button variant="outline" onClick={() => setFiltersOpen(true)}>
              <FilterIcon className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          }
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
        >
          <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Filter transactions by type and tokens
              </p>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <XCircleIcon className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Transaction Type
                </label>
                <Select
                  value={typeFilter}
                  onValueChange={(value) =>
                    setTypeFilter(value as "swap" | "deposit" | "all")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="swap">Swap</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium block">Input Token</label>
                <Select
                  value={inTokenFilter ?? "all"}
                  onValueChange={(value) =>
                    setInTokenFilter(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Input Token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Input Tokens</SelectItem>
                    {uniqueTokens?.map((token) => (
                      <SelectItem key={token} value={token}>
                        <VoucherChip voucher_address={token} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <label className="text-sm font-medium block">
                  Output Token
                </label>
                <Select
                  value={outTokenFilter ?? "all"}
                  onValueChange={(value) =>
                    setOutTokenFilter(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Output Token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Output Tokens</SelectItem>
                    {uniqueTokens?.map((token) => (
                      <SelectItem key={token} value={token}>
                        <VoucherChip voucher_address={token} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </ResponsiveModal>
      </div>
      <div className="w-full overflow-hidden">
        <InfiniteTable
          data={flatData}
          containerClassName="bg-white rounded-lg shadow-sm overflow-x-auto"
          stickyHeader={true}
          onRowClick={(row) => {
            window.open(
              celoscanUrl.tx(row.tx_hash ?? ""),
              "_blank",
              "noopener"
            );
          }}
          columns={[
            {
              accessorKey: "success",
              header: "Success",
              size: 80,
              cell: ({ row }) => {
                return row.original.success ? (
                  <CheckCircleIcon className="text-green-500 size-5" />
                ) : (
                  <XCircleIcon className="text-red-500 size-5" />
                );
              },
            },
            {
              accessorKey: "date_block",
              header: "Date",
              size: 140,
              cell: ({ row }) => {
                return (
                  row.original?.date_block?.toLocaleTimeString([], {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }) ?? "N/A"
                );
              },
            },

            {
              accessorKey: "type",
              header: "Type",
              size: 90,
              cell: ({ row }) => {
                const type = row.original.type;
                return (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                      type === "swap" &&
                        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                      type === "deposit" &&
                        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    )}
                  >
                    {type}
                  </span>
                );
              },
            },
            {
              accessorKey: "initiator_address",
              header: "Initiator",
              size: 120,
              cell: ({ row }) => {
                return (
                  <Address
                    address={row.original?.initiator_address}
                    className="text-sm"
                    truncate={true}
                    forceTruncate={true}
                  />
                );
              },
            },
            {
              accessorKey: "token_in_address",
              header: "From",
              size: 120,
              cell: ({ row }) => {
                return (
                  <VoucherChip
                    voucher_address={
                      row.original?.token_in_address as `0x${string}`
                    }
                  />
                );
              },
            },
            {
              accessorKey: "token_out_address",
              header: "To",
              size: 120,
              cell: ({ row }) => {
                return row.original.type === "swap" ? (
                  <VoucherChip
                    voucher_address={
                      row.original?.token_out_address as `0x${string}`
                    }
                  />
                ) : (
                  "-"
                );
              },
            },
            {
              accessorKey: "in_value",
              header: "Amount In",
              size: 120,
              cell: ({ row }) => {
                return (
                  <VoucherValue
                    address={row.original?.token_in_address}
                    value={row.original?.in_value ?? 0n}
                  />
                );
              },
            },
            {
              accessorKey: "out_value",
              header: "Amount Out",
              size: 120,
              cell: ({ row }) => {
                return row.original.type === "swap" ? (
                  <VoucherValue
                    address={row.original?.token_out_address ?? ""}
                    value={row.original?.out_value ?? 0n}
                  />
                ) : (
                  "-"
                );
              },
            },
            {
              accessorKey: "fee",
              header: "Fee",
              size: 100,
              cell: ({ row }) => {
                return row.original.type === "swap" ? (
                  <VoucherValue
                    address={row.original?.token_out_address ?? ""}
                    value={row.original?.fee ?? 0n}
                  />
                ) : (
                  "-"
                );
              },
            },
          ]}
          hasNextPage={transactions.hasNextPage}
          isLoading={transactions.isFetching || transactions.isFetchingNextPage}
          fetchNextPage={() => {
            void transactions.fetchNextPage();
          }}
        />
      </div>
    </div>
  );
};
