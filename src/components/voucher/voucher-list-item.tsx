import Image from "next/image";
import Link from "next/link";
import { type TokenValue } from "~/utils/units";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const VoucherListItem = ({
  voucher,
  balance,
}: {
  voucher: {
    id: number | undefined;
    voucher_address: string | undefined;
    location_name: string | null;
    symbol: string | undefined;
    voucher_name: string | undefined;
    voucher_description: string | undefined;
    icon_url: string | null;
  };
  balance?: TokenValue | undefined;
}) => {
  const location = voucher.location_name?.split(",");

  return (
    <Link href={`/vouchers/${voucher?.voucher_address ?? ""}`}>
      <div className="flex h-fit w-full items-center justify-between space-x-4 transition-all hover:bg-accent hover:text-accent-foreground p-2">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage
              asChild
              src={voucher?.icon_url ?? "/apple-touch-icon.png"}
            >
              <Image
                src={voucher?.icon_url ?? "/apple-touch-icon.png"}
                alt=""
                width={24}
                height={24}
              />
            </AvatarImage>
            <AvatarFallback>
              {voucher.voucher_name?.substring(0, 2).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="">
            <p className="text-md font-medium leading-none">
              {voucher.voucher_name}
              <span className="mx-2 text-muted-foreground text-sm">
                ({voucher.symbol})
              </span>
            </p>
            {location && (
              <p className="my-1 bg-secondary/20 w-fit p-1  y-1 rounded-md text-sm font-light italic leading-none">
                {location
                  .slice(location.length - 2, location.length)
                  .join(", ")}
              </p>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {voucher.voucher_description}
            </p>
          </div>
        </div>
        {balance && (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">
              {balance.formatted} {voucher.symbol}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};
