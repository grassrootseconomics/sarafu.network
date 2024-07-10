import { keepPreviousData } from "@tanstack/query-core";
import React from "react";
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
  const swaps = api.pool.swaps.useInfiniteQuery(
    {
      address: getAddress(pool!.address),
    },
    {
      enabled: !!pool?.address,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: false,
    }
  );
  const flatData = React.useMemo(
    () => swaps.data?.pages?.flatMap((page) => page.swaps) ?? [],
    [swaps.data]
  );
  return (
    <div className="py-4 px-0 bg-white rounded-lg shadow-lg my-4 mx-2">
      <InfiniteTable
        data={flatData ?? []}
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
              return <VoucherName address={row.original?.token_out_address} />;
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
              return (
                <VoucherValue
                  address={row.original?.token_out_address ?? ""}
                  value={row.original?.out_value ?? 0n}
                />
              );
            },
          },
          {
            accessorKey: "fee",
            header: "Fee",
            cell: ({ row }) => {
              return (
                <VoucherValue
                  address={row.original?.token_out_address ?? ""}
                  value={row.original?.out_value ?? 0n}
                />
              );
            },
          },
        ]}
        hasNextPage={swaps.hasNextPage}
        isLoading={swaps.isFetching || swaps.isFetchingNextPage}
        fetchNextPage={() => {
          void swaps.fetchNextPage();
        }}
      />
    </div>
  );
};
