import React from "react";

import { keepPreviousData } from "@tanstack/react-query";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { formatUnits } from "viem";
import { trpc } from "~/lib/trpc";
import { celoscanUrl } from "~/utils/celo";
import Address from "../address";
import { Icons } from "../icons";
import { useVoucherDetails } from "../pools/hooks";
import { Badge } from "../ui/badge";
import { InfiniteTable } from "./infinite-table";
export function TransactionsTable({
  voucherAddress,
}: {
  voucherAddress: string;
}) {
  //react-query has an useInfiniteQuery hook just for this situation!
  const { data, fetchNextPage, isFetching, isFetchingNextPage, hasNextPage } =
    trpc.transaction.list.useInfiniteQuery(
      {
        voucherAddress: voucherAddress,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
      }
    );
  const { data: details } = useVoucherDetails(voucherAddress as `0x${string}`);

  //we must flatten the array of arrays from the useInfiniteQuery hook
  const flatData = React.useMemo(
    () =>
      data?.pages
        ?.flatMap((page) => page.transactions)
        .map((t) => ({
          ...t,
          value: formatUnits(BigInt(t.value ?? "0"), details?.decimals ?? 0),
        })) ?? [],
    [data, details]
  );
  return (
    <InfiniteTable
      columns={[
        {
          accessorKey: "date_block",
          header: "Date",
          size: 60,
          cell: (info) => (info.getValue() as Date).toLocaleString(),
        },
        {
          accessorKey: "event_type",
          header: "Type",
          size: 60,
          cell: (info) => {
            const eventType = info.getValue<
              "token_transfer" | "token_mint" | "token_burn"
            >();
            return eventType === "token_transfer" ? (
              <Badge variant="outline" className="bg-blue-500 text-white">
                Transfer
              </Badge>
            ) : eventType === "token_mint" ? (
              <Badge variant="outline" className="bg-green-500 text-white">
                Mint
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-500 text-white">
                Burn
              </Badge>
            );
          },
        },
        {
          accessorKey: "from_address",
          header: "From",
          cell: (info) => (
            <Address address={info.getValue<string>()} truncate />
          ),
        },
        {
          accessorKey: "to_address",
          header: "To",
          cell: (info) => (
            <Address address={info.getValue<string>()} truncate />
          ),
        },
        {
          accessorKey: "value",
          header: "Amount",
        },
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
          accessorKey: "tx_hash",
          header: "",
          size: 40,
          cell: (info) => {
            return (
              <Link
                href={celoscanUrl.tx(info.getValue<`0x${string}`>())}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icons.hash />
              </Link>
            );
          },
        },
      ]}
      data={flatData}
      hasNextPage={hasNextPage}
      isLoading={isFetching || isFetchingNextPage}
      fetchNextPage={() => {
        void fetchNextPage();
      }}
    />
  );
}
