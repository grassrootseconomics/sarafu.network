"use client";

import Address from "../address";
import { BasicTable } from "../tables/table";
import { useMultiAccountBalances } from "./hooks";
import { trpc } from "~/lib/trpc";
export function VoucherHoldersTable({
  voucherAddress,
}: {
  voucherAddress: string;
}) {
  const { data: holders, isLoading } = trpc.voucher.holders.useQuery(
    {
      voucherAddress: voucherAddress,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );
  const balances = useMultiAccountBalances(
    holders?.map((d) => d.address as `0x${string}`) ?? [],
    voucherAddress as `0x${string}`
  );
  const data = holders?.map((holder) => ({
    ...holder,
    balance: balances[holder.address as `0x${string}`],
  }));

  return (
    <BasicTable
      isLoading={isLoading}
      data={data ?? []}
      columns={[
        {
          header: "Address",
          accessorKey: "address",
          cell: (info) => (
            <Address truncate={true} address={info.getValue<string>()} />
          ),
        },
        {
          id: "balance",
          header: "Balance",
          accessorKey: "balance.formattedNumber",
        },
      ]}
    />
  );
}
