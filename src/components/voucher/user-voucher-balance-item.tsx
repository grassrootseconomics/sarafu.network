import { ChevronDown, ChevronUp, Eye, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { type TokenValue } from "~/utils/units";
import { SendDialog } from "../dialogs/send-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export const UserVoucherBalanceItem = ({
  voucher,
  balance,
}: {
  voucher: {
    id?: number | undefined;
    voucher_address: string | undefined;
    symbol: string | undefined;
    voucher_name: string | undefined;
    icon_url?: string | null;
  };
  balance?: TokenValue | undefined;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="flex flex-col justify-between transition-all p-4 bg-white rounded-lg hover:bg-gray-50">
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
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
        <div>
          <p className="text-lg font-semibold leading-none">
            {voucher.voucher_name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{voucher.symbol}</p>
        </div>
        {balance && (
          <p className="ml-auto text-lg font-medium">{balance.formatted}</p>
        )}
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isExpanded && (
        <div className="mt-4 flex justify-end gap-2">
          <Link href={`/vouchers/${voucher?.voucher_address ?? ""}`}>
            <Button variant="outline">
              <Eye size={16} className="mr-2" />
              View
            </Button>
          </Link>
          <SendDialog
            button={
              <Button>
                <Send size={16} className="mr-2" />
                Send
              </Button>
            }
            voucherAddress={voucher.voucher_address as `0x${string}`}
          />
        </div>
      )}
    </div>
  );
};
