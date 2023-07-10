//3 TanStack Libraries!!!

import { api } from "~/utils/api";
import Balance from "../balance";
import Address from "../address";
import { BasicTable } from "./table";

export function HoldersTable({ voucherAddress }: { voucherAddress: string }) {
  const { data, isLoading } = api.voucher.holders.useQuery({
    voucherAddress: voucherAddress,
  });
  //we need a reference to the scrolling element for logic down below

  return (
    <BasicTable
      isLoading={isLoading}
      data={data ?? []}
      columns={[
        {
          header: "Address",
          accessorKey: "address",
          cell: (info) => <Address address={info.getValue<string>()} />,
        },
        {
          header: "Created At",
          accessorKey: "created_at",
          cell: (info) => (info.getValue() as Date).toLocaleString(),
        },
        {
          id: "balance",
          header: "Balance",
          accessorFn: (row) => row.address,
          cell: (ctx) => (
            <Balance
              address={ctx.getValue<string>()}
              tokenAddress={voucherAddress}
            />
          ),
        },
      ]}
    />
  );
}
