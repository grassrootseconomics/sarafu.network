"use client";

import { Skeleton } from "../ui/skeleton";
import { useVoucherData } from "./hooks";
import { VoucherIcon } from "./voucher-icon";

interface VoucherMapMarkerProps {
  voucher_address: `0x${string}`;
}

export function VoucherMapMarker({ voucher_address }: VoucherMapMarkerProps) {
  const { voucher, isLoading } = useVoucherData(voucher_address);
  if (isLoading) return <Skeleton className="size-8 rounded-full" />;
  return <VoucherIcon voucher={voucher ?? null} className="size-8" />;
}
