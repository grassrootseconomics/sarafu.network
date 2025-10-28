"use client";

import { PlusIcon } from "@radix-ui/react-icons";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Edit, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Progress } from "~/components/ui/progress";
import { VoucherChip } from "~/components/voucher/voucher-chip";
import { useVoucherSymbol } from "~/components/voucher/voucher-name";
import { useIsContractOwner } from "~/hooks/useIsOwner";
import { type RouterOutputs } from "~/lib/trpc";
import { formatNumber } from "~/utils/units/number";
import { fromRawPriceIndex } from "~/utils/units/pool";
import { ResponsiveModal } from "../../modal";
import { BasicTable } from "../../tables/table";
import { Button } from "../../ui/button";
import { PoolVoucherForm } from "../forms/pool-voucher-form";
import { useSwapPool } from "../hooks";
import { type SwapPool, type SwapPoolVoucher } from "../types";
import {
  getAvailableCreditInDefaultVoucherUnits,
  getHoldingInDefaultVoucherUnits,
  getLimitInDefaultVoucherUnits,
  getPercentage,
} from "../utils";
export const PoolVoucherTable = (props: {
  pool: SwapPool | undefined;
  metadata: RouterOutputs["pool"]["get"];
}) => {
  const { data: pool } = useSwapPool(props.pool?.address, props.pool);
  const isOwner = useIsContractOwner(pool!.address);
  const router = useRouter();
  const data = useMemo(
    () => pool?.voucherDetails ?? [],
    [pool?.voucherDetails]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voucher, setVoucher] = useState<SwapPoolVoucher | null>(null);
  const client = useQueryClient();
  const isFetchingPool = useIsFetching({ queryKey: ["swapPool"] });
  const defulatVoucherSymbol = useVoucherSymbol({
    address: props.metadata?.default_voucher,
  });
  function handleEdit(original: SwapPoolVoucher): void {
    setVoucher(original);
    setIsModalOpen(true);
  }

  const handleSuccess = () => {
    setVoucher(null);
    setIsModalOpen(false);
  };

  const columns: ColumnDef<SwapPoolVoucher>[] = [
    {
      header: "Voucher",
      accessorKey: "symbol",
      size: 50,
      cell: (info) => (
        <VoucherChip
          voucher_address={info.row.original.address}
          truncate={false}
        />
      ),
    },
    {
      header: `Rate (${defulatVoucherSymbol.data || "..."})`,
      accessorKey: "priceIndex",
      accessorFn: (row) => fromRawPriceIndex(row.priceIndex),
      cell: ({ row }) =>
        formatNumber(fromRawPriceIndex(row.original.priceIndex)),
    },
    {
      header: `Holding Debt (${defulatVoucherSymbol.data || "..."})`,
      accessorKey: "holding",
      cell: ({ row }) =>
        formatNumber(getHoldingInDefaultVoucherUnits(row.original), {
          maxDecimalDigits: 0,
        }),
    },
    {
      header: `Available Credit (${defulatVoucherSymbol.data || "..."})`,
      accessorKey: "credit",
      sortingFn: (a, b) => {
        const aBalance = a.original.poolBalance?.formattedNumber ?? 0;
        const aLimit = a.original.limitOf?.formattedNumber ?? 0;
        const aFill = aBalance / aLimit;
        const bBalance = b.original.poolBalance?.formattedNumber ?? 0;
        const bLimit = b.original.limitOf?.formattedNumber ?? 0;
        const bFill = bBalance / bLimit;

        if (isNaN(aFill)) return -1;
        if (isNaN(bFill)) return 1;
        return aFill - bFill;
      },
      cell: ({ row }) => {
        const limitInDV = getLimitInDefaultVoucherUnits(row.original);
        const creditInDV = getAvailableCreditInDefaultVoucherUnits(
          row.original
        );
        const percentage = getPercentage(row.original);
        return (
          <div className="flex flex-col w-full max-w-[100px]">
            <Progress value={percentage} className="h-2 w-full" />
            <div className="text-xs text-gray-500 text-right mt-1">
              {`${formatNumber(creditInDV, {
                maxDecimalDigits: 0,
              })} / ${formatNumber(limitInDV)}`}
            </div>
          </div>
        );
      },
    },
  ];

  if (isOwner) {
    columns.push({
      header: "Edit",
      cell: ({ row }: { row: { original: SwapPoolVoucher } }) => {
        return (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.original);
            }}
            size="sm"
            variant="ghost"
          >
            <Edit className="h-4 w-4" />
          </Button>
        );
      },
    });
  }

  return (
    <div>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4 flex-wrap justify-between w-full space-y-2">
          <div className="ml-auto flex space-x-2 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => client.refetchQueries({ queryKey: ["swapPool"] })}
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetchingPool ? "animate-spin" : ""}`}
              />
            </Button>
            {isOwner && (
              <ResponsiveModal
                open={isModalOpen}
                onOpenChange={(open) => {
                  if (!open) setVoucher(null);
                  setIsModalOpen(open);
                }}
                title={voucher ? "Edit Voucher" : "Approve Voucher"}
                button={
                  <Button variant="outline" size="sm">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Approve Voucher
                  </Button>
                }
              >
                {pool && (
                  <PoolVoucherForm
                    metadata={props.metadata}
                    pool={pool}
                    voucher={voucher}
                    onSuccess={handleSuccess}
                  />
                )}
              </ResponsiveModal>
            )}
          </div>
        </div>
      </div>
      <div className="p-0 bg-white rounded-lg shadow-sm">
        {data.length > 0 ? (
          <BasicTable
            data={data}
            stickyHeader={true}
            onRowClick={(row) => {
              void router.push(`/vouchers/${row.address}`);
            }}
            columns={columns}
          />
        ) : (
          <div className="p-6 text-center text-gray-500 flex flex-col items-center">
            <AlertTriangle className="h-8 w-8 mb-2 text-yellow-500" />
            {isOwner ? (
              <p>
                No vouchers found. Click the &quot;Approve Voucher&quot; button
                above to add vouchers to this pool.
              </p>
            ) : (
              <p>No vouchers found in this pool.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
