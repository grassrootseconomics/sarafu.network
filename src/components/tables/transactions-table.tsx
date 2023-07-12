import React from "react";

//3 TanStack Libraries!!!

import { formatUnits } from "viem";
import { api } from "~/utils/api";
import Address from "../address";
import { Badge } from "../ui/badge";
import { InfiniteTable } from "./infinite-table";

export function TransactionsTable({
  voucherAddress,
}: {
  voucherAddress: string;
}) {
  //react-query has an useInfiniteQuery hook just for this situation!
  const { data, fetchNextPage, isFetching, isFetchingNextPage, hasNextPage } =
    api.transaction.infiniteTransaction.useInfiniteQuery(
      {
        voucherAddress: voucherAddress,
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
          accessorKey: "sender_address",
          header: "Sender",
          cell: (info) => <Address address={info.getValue<string>()} shrink />,
        },
        {
          accessorKey: "recipient_address",
          header: "Recipient",
          cell: (info) => <Address address={info.getValue<string>()} shrink />,
        },
        {
          accessorKey: "tx_value",
          header: "Amount",
          cell: (info) => formatUnits(BigInt(info.getValue<string>()), 6),
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
