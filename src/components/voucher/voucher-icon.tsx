import Image from "next/image";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
export function VoucherIcon({
  voucher_address,
  className,
}: {
  voucher_address: `0x${string}`;
  className?: string;
}) {
  const voucher = trpc.voucher.byAddress.useQuery(
    {
      voucherAddress: voucher_address,
    },
    {
      enabled: !!voucher_address,
      staleTime: Infinity,
    }
  );
  return (
    <Image
      src={voucher.data?.icon_url ?? "/apple-touch-icon.png"}
      alt={`${voucher.data?.voucher_name}`}
      width={24}
      height={24}
      className={cn(
        "h-6 w-6 rounded-full outline outline-1 outline-muted",
        className
      )}
    />
  );
}
