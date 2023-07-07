import React from "react";

//3 TanStack Libraries!!!

import { api } from "~/utils/api";
import Address from "../Address";
import { Badge } from "../ui/badge";
import { InfiniteTable } from "./infinite-table";

export function TransactionsTable({ address }: { address: string }) {
  //react-query has an useInfiniteQuery hook just for this situation!
  const { data, fetchNextPage, isFetching, isFetchingNextPage, hasNextPage } =
    api.transaction.infiniteTransaction.useInfiniteQuery(
      {
        voucherAddress: address,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        keepPreviousData: true,
        refetchOnWindowFocus: false,
      }
    );
  //we must flatten the array of arrays from the useInfiniteQuery hook
  const flatData = React.useMemo(
    () => data?.pages?.flatMap((page) => page.transactions) ?? [],
    [data]
  );

  return (
    <InfiniteTable
      data={flatData}
      columns={[
        {
          accessorKey: "date_block",
          header: "Date",
          size: 60,
          cell: (info) => (info.getValue() as Date).toLocaleString(),
        },
        {
          header: "Type",
          accessorKey: "tx_type",
          cell: (info) => (
            <Badge
              variant={info.getValue() === "TRANSFER" ? "success" : "warning"}
            >
              {info.getValue() as string}
            </Badge>
          ),
        },
        {
          accessorKey: "recipient_address",
          header: "Recipient",
          cell: (info) => <Address address={info.getValue<string>()} shrink />,
        },
        {
          accessorKey: "sender_address",
          header: "Sender",
          cell: (info) => <Address address={info.getValue<string>()} shrink />,
        },
        {
          accessorKey: "tx_value",
          header: "Amount",
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "success",
          header: "Success",
          cell: (info) => (
            <Badge variant={info.getValue() ? "success" : "destructive"}>
              {info.getValue() ? "Success" : "Failed"}
            </Badge>
          ),
        },
      ]}
      hasNextPage={hasNextPage}
      isLoading={isFetching || isFetchingNextPage}
      fetchNextPage={() => {
        void fetchNextPage();
      }}
    />
  );
}
