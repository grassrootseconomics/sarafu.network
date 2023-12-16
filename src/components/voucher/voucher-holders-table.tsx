//3 TanStack Libraries!!!

import { api } from "~/utils/api";
import Address from "../address";
import Balance from "../balance";
import { BasicTable } from "../tables/table";

export function VoucherHoldersTable({
  voucherAddress,
}: {
  voucherAddress: string;
}) {
  const { data, isLoading } = api.voucher.holders.useQuery({
    voucherAddress: voucherAddress,
  });
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
