import { keepPreviousData } from "@tanstack/query-core";
import React from "react";
import { getAddress } from "viem";
import { trpc } from "~/lib/trpc";
import { celoscanUrl } from "~/utils/celo";
import Address from "../../address";
import { InfiniteTable } from "../../tables/infinite-table";
import { VoucherName, VoucherValue } from "../../voucher/voucher-name";
import { type SwapPool } from "../types";
export const PoolDepositsTable = ({ pool }: { pool: SwapPool | undefined }) => {
  const deposits = trpc.pool.deposits.useInfiniteQuery(
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
    () => deposits.data?.pages?.flatMap((page) => page.deposits) ?? [],
    [deposits.data]
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
        ]}
        hasNextPage={deposits.hasNextPage}
        isLoading={deposits.isFetching || deposits.isFetchingNextPage}
        fetchNextPage={() => {
          void deposits.fetchNextPage();
        }}
      />
    </div>
  );
};
