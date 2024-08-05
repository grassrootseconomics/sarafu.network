import { PlusIcon } from "@radix-ui/react-icons";
import { type ColumnDef } from "@tanstack/react-table";
import { EditIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { truncateByDecimalPlace } from "~/utils/number";
import { ResponsiveModal } from "../../modal";
import { BasicTable } from "../../tables/table";
import { Button } from "../../ui/button";
import { PoolVoucherForm } from "../forms/pool-voucher-form";
import { type SwapPool, type SwapPoolVoucher } from "../types";

export const PoolVoucherTable = ({
  pool,
  isWriter,
}: {
  pool: SwapPool | undefined;
  isWriter: boolean;
}) => {
  const router = useRouter();
  const data = pool?.voucherDetails ?? [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voucher, setVoucher] = useState<SwapPoolVoucher | null>(null);
  function handleEdit(original: SwapPoolVoucher): void {
    setVoucher(original);
    setIsModalOpen(true);
  }
  const handleSuccess = () => {
    setVoucher(null);
    setIsModalOpen(false);
  };
  const columns: ColumnDef<SwapPoolVoucher>[] = [
    { header: "Symbol", accessorKey: "symbol" },
    { header: "Name", accessorKey: "name" },
    {
      header: "Rate (KES)",
      accessorKey: "priceIndex",
      accessorFn: (row) =>
        truncateByDecimalPlace(Number(row.priceIndex) / 10000, 3),
    },
    // {
    //   header: "Holding",
    //   accessorFn: (row: SwapPoolVoucher) =>
    //     row.poolBalance?.formatted,
    // },
    {
      header: "Holding",
      accessorFn: (row) => row.poolBalance?.formattedNumber,
      sortingFn: (a, b) => {
        const aBalance = a.original.poolBalance?.formattedNumber ?? 0;
        const aLimit = a.original.limitOf?.formattedNumber ?? 0;

        const aFill = aBalance / aLimit;
        const bBalance = b.original.poolBalance?.formattedNumber ?? 0;
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
                    fill === 0 && cap === 0 ? "0%" : `${(fill / cap) * 100}%`,
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
  ];
  if (isWriter) {
    columns.push({
      header: "Edit",
      cell: ({ row }: { row: { original: SwapPoolVoucher } }) => {
        return (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.original);
            }}
            size="xs"
            variant={"ghost"}
          >
            <EditIcon className="size-4" />
          </Button>
        );
      },
    });
  }
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-end ">
        {isWriter && (
          <ResponsiveModal
            open={isModalOpen}
            onOpenChange={(open) => {
              if (!open) {
                setVoucher(null);
              }
              setIsModalOpen(open);
            }}
            title={voucher ? "Edit Voucher" : "Add Voucher"}
            button={
              <Button variant={"outline"} size={"sm"}>
                <PlusIcon className="mr-4" />
                Add Voucher
              </Button>
            }
          >
            {pool && (
              <PoolVoucherForm
                pool={pool}
                voucher={voucher}
                onSuccess={handleSuccess}
              />
            )}
          </ResponsiveModal>
        )}
      </div>

      <div className="py-4 px-0 bg-white rounded-lg shadow-lg my-4 mx-2">
        <BasicTable
          data={data}
          containerClassName="max-h-[550px] overflow-y-auto"
          stickyHeader={true}
          onRowClick={(row) => {
            void router.push(`/vouchers/${row.address}`);
          }}
          columns={columns}
        />
      </div>
    </div>
  );
};
