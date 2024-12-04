import Image from "next/image";
import { trpc } from "~/lib/trpc";
import { useVoucherDetails } from "../pools/hooks";
import { Skeleton } from "../ui/skeleton";
export function VoucherChip({
  voucher_address,
}: {
  voucher_address: `0x${string}`;
}) {
  const details = useVoucherDetails(voucher_address);
  const voucher = trpc.voucher.byAddress.useQuery({
    voucherAddress: voucher_address,
  });
  if (details.isLoading) return <Skeleton className="h-6 w-12 rounded-full" />;
  return (
    <div className="flex items-center gap-3">
      <Image
        src={voucher.data?.icon_url ?? "/apple-touch-icon.png"}
        alt={`${details.data?.name} icon`}
        width={24}
        height={24}
        className="h-6 w-6 rounded-full"
      />
      <span className="flex flex-col w-full items-start">
        <span className="truncate">
          {details.data?.name && details.data?.name.length > 8
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
