import { useRouter } from "next/router";
import { truncateByDecimalPlace } from "~/utils/number";
import { Icons } from "../icons";
import { BasicTable } from "../tables/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { type useSwapPool } from "./hooks";
import { type SwapPoolVoucher } from "./types";

export const SwapPoolVoucherTable = ({
  pool,
}: {
  pool: ReturnType<typeof useSwapPool>;
}) => {
  const router = useRouter();
  return (
    <Card className="overflow-x-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <Icons.vouchers />
          Vouchers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <BasicTable
            data={pool?.voucherDetails.data ?? []}
            containerClassName="max-h-[830px] overflow-y-auto"
            stickyHeader={true}
            onRowClick={(row) => {
              void router.push(`/vouchers/${row.address}`);
            }}
            columns={
              [
                { header: "Symbol", accessorKey: "symbol" },
                { header: "Name", accessorKey: "name" },
                {
                  header: "Rate (KES)",
                  accessorKey: "priceIndex",
                  accessorFn: (row: SwapPoolVoucher) =>
                    truncateByDecimalPlace(Number(row.priceIndex) / 1000, 3),
                },
                // {
                //   header: "Holding",
                //   accessorFn: (row: SwapPoolVoucher) =>
                //     row.poolBalance?.formatted,
                // },
                {
                  header: "Holding",
                  accessorFn: (row: SwapPoolVoucher) =>
                    row.poolBalance?.formattedNumber,
                  sortingFn: (a, b) => {
                    const aBalance =
                      a.original.poolBalance?.formattedNumber ?? 0;
                    const aLimit = a.original.limitOf?.formattedNumber ?? 0;

                    const aFill = aBalance / aLimit;
                    const bBalance =
                      b.original.poolBalance?.formattedNumber ?? 0;
                    const bLimit = b.original.limitOf?.formattedNumber ?? 0;

                    const bFill = bBalance / bLimit;

                    if (isNaN(aFill)) {
                      return -1;
                    }
                    if (isNaN(bFill)) {
                      return 1;
                    }
                    return aFill - bFill;
                  },
                  cell: ({ row }: { row: { original: SwapPoolVoucher } }) => {
                    const fill = truncateByDecimalPlace(
                      row.original.poolBalance?.formattedNumber ?? 0,
                      0
                    );
                    const cap = truncateByDecimalPlace(
                      row.original.limitOf?.formattedNumber ?? 0,
                      0
                    );
                    return (
                      <div className="flex flex-col">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 rounded-full h-2"
                            style={{
                              width:
                                fill === 0 && cap === 0
                                  ? "0%"
                                  : `${(fill / cap) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          {fill} / {cap}
                        </div>
                      </div>
                    );
                  },
                },
                // {
                //   header: "Cap",
                //   accessorFn: (row: SwapPoolVoucher) => row.limitOf?.formatted,
                // },
              ] as const
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};
