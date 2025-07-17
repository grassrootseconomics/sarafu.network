import Image from "next/image";
import { type RouterOutputs } from "~/lib/trpc";
import { cn } from "~/lib/utils";
export function VoucherIcon({
  voucher,
  className,
}: {
  voucher: RouterOutputs["voucher"]["byAddress"] | null;
  className?: string;
}) {
  return (
    <Image
      src={voucher?.icon_url ?? "/apple-touch-icon.png"}
      alt={voucher?.voucher_name ?? 'Voucher icon'}  
      width={24}
      height={24}
      className={cn(
        "h-6 w-6 rounded-full outline outline-1 outline-muted",
        className
      )}
    />
  );
}
