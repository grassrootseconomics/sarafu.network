"use client";

import { keepPreviousData } from "@tanstack/query-core";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { getAddress } from "viem";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { celoscanUrl } from "~/utils/celo";
import Address from "../../address";
import { InfiniteTable } from "../../tables/infinite-table";
import { VoucherName, VoucherValue } from "../../voucher/voucher-name";
import { type SwapPool } from "../types";
import { trpc } from "~/lib/trpc";
export const PoolTransactionsTable = ({
  pool,
}: {
  pool: SwapPool | undefined;
}) => {
  const [typeFilter, setTypeFilter] = useState<"swap" | "deposit" | "all">(
    "all"
  );
  const [inTokenFilter, setInTokenFilter] = useState<string | null>(null);
  const [outTokenFilter, setOutTokenFilter] = useState<string | null>(null);

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

  const uniqueTokens = useMemo(() => {
    const tokens = new Set<string>();
    flatData.forEach((transaction) => {
      if (transaction.token_in_address)
        tokens.add(transaction.token_in_address);
      if (transaction.token_out_address)
        tokens.add(transaction.token_out_address);
    });
    return Array.from(tokens);
  }, [flatData]);

  const clearFilters = () => {
    setTypeFilter("all");
    setInTokenFilter(null);
    setOutTokenFilter(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Transaction History</span>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <XCircleIcon className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center gap-4 mb-4 px-6">
          <div className="flex-grow min-w-[200px]">
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as "swap" | "deposit" | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="swap">Swap</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-grow min-w-[200px]">
            <Select
              value={inTokenFilter ?? "all"}
              onValueChange={(value) =>
                setInTokenFilter(value === "all" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="In Token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All In Tokens</SelectItem>
                {uniqueTokens.map((token) => (
                  <SelectItem key={token} value={token}>
                    <VoucherName address={token} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-grow min-w-[200px]">
            <Select
              value={outTokenFilter ?? "all"}
              onValueChange={(value) =>
                setOutTokenFilter(value === "all" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Out Token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Out Tokens</SelectItem>
                {uniqueTokens.map((token) => (
                  <SelectItem key={token} value={token}>
                    <VoucherName address={token} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <InfiniteTable
          data={flatData}
          containerClassName="max-h-[600px] overflow-y-auto"
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
              cell: ({ row }) => {
                return row.original.type === "swap" ? "Swap" : "Deposit";
              },
            },
            {
              accessorKey: "initiator_address",
              header: "Initiator",
              cell: ({ row }) => {
                return (
                  <Address
                    address={row.original?.initiator_address}
                    className="text-sm"
                  />
                );
              },
            },
            {
              accessorKey: "token_in_address",
              header: "From",
              cell: ({ row }) => {
                return <VoucherName address={row.original?.token_in_address} />;
              },
            },
            {
              accessorKey: "token_out_address",
              header: "To",
              cell: ({ row }) => {
                return row.original.type === "swap" ? (
                  <VoucherName address={row.original?.token_out_address} />
                ) : (
                  "-"
                );
              },
            },
            {
              accessorKey: "in_value",
              header: "Amount In",
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
      </CardContent>
    </Card>
  );
};
