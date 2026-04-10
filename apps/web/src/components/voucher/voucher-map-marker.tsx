"use client";

import { useVoucherDetails } from "../pools/hooks";
import { Skeleton } from "../ui/skeleton";
import { VoucherIcon } from "./voucher-icon";

interface VoucherMapMarkerProps {
  voucher_address: `0x${string}`;
}

export function VoucherMapMarker({ voucher_address }: VoucherMapMarkerProps) {
  const details = useVoucherDetails(voucher_address);
  if (details.isLoading) return <Skeleton className="size-8 rounded-full" />;
  return <VoucherIcon voucher_address={voucher_address} className="size-8" />;
}
