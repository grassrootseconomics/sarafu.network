import Link from "next/link";
import { useAccount, useBalance } from "wagmi";
import { useIsMounted } from "~/hooks/useIsMounted";
import { toUserUnitsString } from "~/utils/units";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const VoucherListItem = ({
  voucher,
}: {
  voucher: {
    id: number | undefined;
    voucher_address: string | undefined;
    location_name: string | null;
    symbol: string | undefined;
    voucher_name: string | undefined;
    voucher_description: string | undefined;
  };
}) => {
  const isMounted = useIsMounted();
  const { address } = useAccount();
  const { data: balance } = useBalance({
    token: voucher.voucher_address as `0x${string}`,
    address: address as `0x${string}`,
  });

  return (
    <Link href={`/vouchers/${voucher?.voucher_address ?? ""}`}>
      <div className="flex items-center justify-between space-x-4 transition-all hover:bg-accent hover:text-accent-foreground p-2">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="/apple-touch-icon.png" />
            <AvatarFallback>
              {voucher.voucher_name?.substring(0, 2).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">
              {voucher.voucher_name}
            </p>

            <p className="p-1 text-sm text-muted-foreground">
              {voucher.voucher_description}
            </p>
          </div>
        </div>

        <p className="text-end text-sm font-medium leading-none mr-4">
          {isMounted && toUserUnitsString(balance?.value, balance?.decimals)}{" "}
          <span className="font-light">{voucher.symbol}</span>
        </p>
      </div>
    </Link>
  );
};
