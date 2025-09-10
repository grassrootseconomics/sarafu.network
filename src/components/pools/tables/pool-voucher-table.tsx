"use client";

import { PlusIcon } from "@radix-ui/react-icons";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Edit, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Progress } from "~/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { VoucherChip } from "~/components/voucher/voucher-chip";
import { useAuth } from "~/hooks/useAuth";
import { CUSD_TOKEN_ADDRESS } from "~/lib/contacts";
import { truncateByDecimalPlace } from "~/utils/number";
import { ResponsiveModal } from "../../modal";
import { BasicTable } from "../../tables/table";
import { Button } from "../../ui/button";
import { PoolVoucherForm } from "../forms/pool-voucher-form";
import { useSwapPool } from "../hooks";
import { type SwapPool, type SwapPoolVoucher } from "../types";

const ABSOLUTE_RATE_VALUE = "absolute_rate";

export const PoolVoucherTable = (props: { pool: SwapPool | undefined }) => {
  const auth = useAuth();
  const { data: pool } = useSwapPool(props.pool?.address, props.pool);
  const isOwner = Boolean(
    auth?.session && pool?.owner && pool?.owner === auth?.session?.address
  );
  const router = useRouter();
  const data = useMemo(
    () => pool?.voucherDetails ?? [],
    [pool?.voucherDetails]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voucher, setVoucher] = useState<SwapPoolVoucher | null>(null);
  const client = useQueryClient();
  const isFetchingPool = useIsFetching({ queryKey: ["swapPool"] });
  const [baseVoucher, setBaseVoucher] = useState<SwapPoolVoucher | null>(() => {
    const cUSDVoucher = data.find(
      (v) => v.address.toLowerCase() === CUSD_TOKEN_ADDRESS.toLowerCase()
    );
    return cUSDVoucher ?? null;
  });

  useEffect(() => {
    if (baseVoucher) return;
    const cUSDVoucher = data.find(
      (v) => v.address.toLowerCase() === CUSD_TOKEN_ADDRESS.toLowerCase()
    );
    if (cUSDVoucher) setBaseVoucher(cUSDVoucher);
  }, [data, baseVoucher]);

  function handleEdit(original: SwapPoolVoucher): void {
    setVoucher(original);
    setIsModalOpen(true);
  }

  const handleSuccess = () => {
    setVoucher(null);
    setIsModalOpen(false);
  };

  function getRelativeRate(voucher: SwapPoolVoucher): number {
    if (!baseVoucher) return Number(voucher.priceIndex) / 10000;

    const baseRate = Number(baseVoucher.priceIndex);
    const voucherRate = Number(voucher.priceIndex);

    if (baseRate === 0) return 0;
    return voucherRate / baseRate;
  }

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
      header: "Rate",
      accessorKey: "priceIndex",
      accessorFn: (row) => getRelativeRate(row),
      cell: ({ row }) => {
        const rate = getRelativeRate(row.original);
        if (!baseVoucher) return truncateByDecimalPlace(rate, 3);

        return (
          <div className="flex items-center space-x-1">
            <span>{truncateByDecimalPlace(rate, 3)}</span>
            <span className="text-muted-foreground text-sm">
              {baseVoucher.symbol}
            </span>
          </div>
        );
      },
    },
    {
      header: "Holding Debt",
      accessorKey: "holding",
      cell: ({ row }) => {
        const holding = truncateByDecimalPlace(
          row.original.poolBalance?.formattedNumber ?? 0,
          2
        );
        return (
          <div className="flex flex-col w-full max-w-[100px]">{holding}</div>
        );
      },
    },
    {
      header: "Available Credit",
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
        const holding = truncateByDecimalPlace(
          row.original.poolBalance?.formattedNumber ?? 0,
          2
        );
        const cap = truncateByDecimalPlace(
          row.original.limitOf?.formattedNumber ?? 0,
          2
        );
        // Not less than 0
        const credit = truncateByDecimalPlace(Math.max(cap - holding, 0), 2);
        const percentage = cap === 0 ? 0 : (credit / cap) * 100;
        return (
          <div className="flex flex-col w-full max-w-[100px]">
            <Progress value={percentage} className="h-2 w-full" />
            <div className="text-xs text-gray-500 text-right mt-1">
              {`${credit} / ${cap}`}
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
            {data.length > 0 && (
              <Select
                value={baseVoucher?.address ?? ABSOLUTE_RATE_VALUE}
                onValueChange={(value) => {
                  if (value === ABSOLUTE_RATE_VALUE) {
                    setBaseVoucher(null);
                    return;
                  }
                  const selected = data.find((v) => v.address === value);
                  setBaseVoucher(selected ?? null);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select base voucher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ABSOLUTE_RATE_VALUE}>
                    Absolute Rate
                  </SelectItem>
                  {data.map((voucher) => (
                    <SelectItem key={voucher.address} value={voucher.address}>
                      {voucher.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
