import { keepPreviousData } from "@tanstack/query-core";
import { XCircleIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { getAddress } from "viem";
import { api } from "~/utils/api";
import { celoscanUrl } from "~/utils/celo";
import Address from "../../address";
import { InfiniteTable } from "../../tables/infinite-table";
import { VoucherName, VoucherValue } from "../../voucher/voucher-name";
import { type SwapPool } from "../types";

export const PoolTransactionsTable = ({
  pool,
}: {
  pool: SwapPool | undefined;
}) => {
  const [typeFilter, setTypeFilter] = useState<"swap" | "deposit" | 'all'>('all');
  const [inTokenFilter, setInTokenFilter] = useState<string | null>(null);
  const [outTokenFilter, setOutTokenFilter] = useState<string | null>(null);

  const transactions = api.pool.transactions.useInfiniteQuery(
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
    setTypeFilter(null);
    setInTokenFilter(null);
    setOutTokenFilter(null);
  };

  return (
    <div className="py-4 px-4 bg-white rounded-lg shadow-lg my-4 mx-2">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex-grow">
          <label
            htmlFor="typeFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Transaction Type
          </label>
          <select
            id="typeFilter"
            value={typeFilter ?? "all"}
            onChange={(e) => setTypeFilter(e.target.value as "swap" | "deposit" | 'all')}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
          >
            <option value="all">All Types</option>
            <option value="swap">Swap</option>
            <option value="deposit">Deposit</option>
          </select>
        </div>
        <div className="flex-grow">
          <label
            htmlFor="inTokenFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            In Token
          </label>
          <select
            id="inTokenFilter"
            value={inTokenFilter ?? ""}
            onChange={(e) => setInTokenFilter(e.target.value || null)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
          >
            <option value="">All In Tokens</option>
            {uniqueTokens.map((token) => (
              <option key={token} value={token}>
                <VoucherName address={token} />
              </option>
            ))}
          </select>
        </div>
        <div className="flex-grow">
          <label
            htmlFor="outTokenFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Out Token
          </label>
          <select
            id="outTokenFilter"
            value={outTokenFilter ?? ""}
            onChange={(e) => setOutTokenFilter(e.target.value || null)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
          >
            <option value="">All Out Tokens</option>
            {uniqueTokens.map((token) => (
              <option key={token} value={token}>
                <VoucherName address={token} />
              </option>
            ))}
          </select>
        </div>
        <div className="flex-shrink-0 self-end">
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <XCircleIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
            Clear Filters
          </button>
        </div>
      </div>
      <InfiniteTable
        data={transactions.data?.pages.flatMap((page) => page.transactions) ?? []}
        containerClassName="max-h-[600px] overflow-y-auto"
        stickyHeader={true}
        onRowClick={(row) => {
          window.open(celoscanUrl.tx(row.tx_hash ?? ""), "_blank", "noopener");
        }}
        columns={[
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
    </div>
  );
};
