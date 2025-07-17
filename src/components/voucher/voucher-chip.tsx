"use client";

import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { useVoucherData } from "./hooks";
import { VoucherIcon } from "./voucher-icon";

interface VoucherChipProps {
  voucher_address: `0x${string}`;
  truncate?: boolean;
  className?: string;
  clickable?: boolean;
}

export function VoucherChip({
  voucher_address,
  truncate = false,
  className,
  clickable = false,
}: VoucherChipProps) {
  const { details, voucher, isLoading } = useVoucherData(voucher_address);
  const router = useRouter();
  if (isLoading) return <Skeleton className="h-6 w-12 rounded-full" />;
  return (
    <div
      className={cn(
        "flex items-center gap-2 pr-4 rounded-full shrink",
        clickable && "cursor-pointer",
        className
      )}
      onClick={() => {
        if (clickable) {
          router.push(`/vouchers/${voucher_address}`);
        }
      }}
    >
      <VoucherIcon voucher={voucher ?? null} className="size-8" />
      <span className="flex flex-col w-full items-start text-xs">
        <span className="truncate">
          {details?.name && truncate && details?.name.length > 8
            ? `${details.name.slice(0, 8)}..`
            : details?.name}
        </span>
        <span className="text-xs text-muted-foreground">{details?.symbol}</span>
      </span>
    </div>
  );
}
