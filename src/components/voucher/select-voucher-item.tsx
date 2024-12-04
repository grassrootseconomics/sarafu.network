import Image from "next/image";
import { useAccount, useBalance } from "wagmi";
export function VoucherSelectItem(props: {
  voucher: Voucher;
  showBalance?: boolean;
}) {
  const { voucher, showBalance = true } = props;
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
    token: voucher.address,
    query: {
      enabled: !voucher.balance && !!address && showBalance,
    },
  });

  return (
    <div className="flex w-full items-center justify-between gap-3 p-2">
      <div className="flex items-center gap-3">
        {voucher.icon  !== undefined && <Image
          src={voucher.icon ?? "/apple-touch-icon.png"}
          alt={`${voucher.name} icon`}
          width={24}
          height={24}
          className="h-6 w-6 rounded-full"
        />}
        <span className="flex flex-col w-full items-start">
          <span className="truncate">{voucher.name}</span>
          <span className="text-xs text-muted-foreground">
            {voucher.symbol}
          </span>
        </span>
      </div>
      {showBalance && <div>{voucher.balance ?? balance?.formatted ?? ""}</div>}
    </div>
  );
}

// Interfaces

interface Voucher {
  address: `0x${string}`;
  name: string;
  symbol: string;
  icon?: string | null;
  balance?: string;
}
