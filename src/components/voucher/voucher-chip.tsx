import { useVoucherDetails } from "../pools/hooks";
import { Skeleton } from "../ui/skeleton";
import { VoucherIcon } from "./voucher-icon";
export function VoucherChip({
  voucher_address,
  truncate = true,
}: {
  voucher_address: `0x${string}`;
  truncate?: boolean;
}) {
  const details = useVoucherDetails(voucher_address);
  if (details.isLoading) return <Skeleton className="h-6 w-12 rounded-full" />;
  return (
    
    <div className="flex items-center gap-2 pr-4 bg-muted rounded-full">
      <VoucherIcon voucher_address={voucher_address} className="size-8" />
      <span className="flex flex-col w-full items-start text-xs">
        <span className="truncate">
          {details.data?.name && truncate && details.data?.name.length > 8
            ? `${details.data.name.slice(0, 8)}..`
            : details.data?.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {details.data?.symbol}
        </span>
      </span>
    </div>
  );
}
