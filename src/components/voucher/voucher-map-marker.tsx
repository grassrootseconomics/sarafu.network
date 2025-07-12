"use client";

import { trpc } from "~/lib/trpc";
import { useVoucherDetails } from "../pools/hooks";
import { Skeleton } from "../ui/skeleton";
import { VoucherIcon } from "./voucher-icon";

interface VoucherMapMarkerProps {
  voucher_address: `0x${string}`;
}

export function VoucherMapMarker({ voucher_address }: VoucherMapMarkerProps) {
  const details = useVoucherDetails(voucher_address);
  const { data: voucher } = trpc.voucher.byAddress.useQuery(
    { voucherAddress: voucher_address },
    { enabled: !!voucher_address, staleTime: Infinity }
  );
  if (details.isLoading) return <Skeleton className="size-8 rounded-full" />;
  return <VoucherIcon voucher={voucher} className="size-8" />;
}
