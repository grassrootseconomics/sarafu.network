"use client";

import { Eye, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import { cn } from "~/lib/utils";
import { type TokenValue } from "~/utils/units/token";
import { SendDialog } from "../dialogs/send-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

interface UserVoucherBalanceItemProps {
  voucher: {
    id?: number | undefined;
    voucher_address: string | undefined;
    symbol: string | undefined;
    voucher_type: string | undefined;
    voucher_name: string | undefined;
    icon_url?: string | null;
  };
  balance?: TokenValue | undefined;
}

function truncateWithEllipsis(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

export function UserVoucherBalanceItem({
  voucher,
  balance,
}: UserVoucherBalanceItemProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const truncatedName = truncateWithEllipsis(voucher.voucher_name || "", 20);
  const shouldShowTooltip = (voucher.voucher_name?.length || 0) > 20;
  const hasBalance = balance && balance.value > BigInt(0);

  const handleCardClick = (e: React.MouseEvent) => {
    // On mobile, open the drawer instead of navigating
    if (!isDesktop) {
      e.preventDefault();
      setIsDrawerOpen(true);
    }
  };

  const handleViewVoucher = () => {
    setIsDrawerOpen(false);
    router.push(`/vouchers/${voucher.voucher_address}`);
  };

  // List View (default)
  return (
    <>
      <div
        className={cn(
          "group relative flex items-center justify-between w-full",
          "bg-card rounded-xl border-2",
          "transition-all duration-200",
          "hover:border-primary/20 hover:shadow-md hover:scale-[1.01]",
          "p-4 gap-4",
          !isDesktop && "cursor-pointer"
        )}
        onClick={handleCardClick}
      >
        {/* Left: Icon and Info */}
        <Link
          href={`/vouchers/${voucher?.voucher_address ?? ""}`}
          className="flex items-center gap-4 flex-1 min-w-0"
          onClick={(e) => {
            if (!isDesktop) {
              e.preventDefault();
            }
          }}
        >
          <Avatar className="border-2 shadow-sm group-hover:shadow-md transition-all shrink-0 size-12 sm:size-14">
            <AvatarImage
              asChild
              src={voucher?.icon_url ?? "/apple-touch-icon.png"}
            >
              <Image
                src={voucher?.icon_url ?? "/apple-touch-icon.png"}
                alt={`${voucher.voucher_name} icon`}
                width={56}
                height={56}
                className="object-cover"
              />
            </AvatarImage>
            <AvatarFallback className="text-base font-bold">
              {voucher.voucher_name?.substring(0, 2).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <h3 className="text-base sm:text-lg font-bold leading-none truncate">
                      {shouldShowTooltip ? truncatedName : voucher.voucher_name}
                    </h3>
                  </TooltipTrigger>
                  {shouldShowTooltip && (
                    <TooltipContent
                      side="top"
                      className="max-w-[250px] break-words"
                    >
                      <p>{voucher.voucher_name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              {hasBalance && (
                <span className="w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
              )}
            </div>
          </div>
        </Link>

        {/* Right: Balance and Actions */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="text-right min-w-[80px] sm:min-w-[100px]">
            <p className="text-lg sm:text-xl font-bold tabular-nums truncate">
              {balance?.formatted ?? "0"}
            </p>
            <p className="text-sm text-muted-foreground font-medium truncate">
              {voucher.symbol}
            </p>
          </div>

          <div className="hidden sm:flex gap-2">
            <Link href={`/vouchers/${voucher?.voucher_address ?? ""}`}>
              <Button variant="outline" size="sm">
                <Eye className="size-4 mr-1.5" />
                View
              </Button>
            </Link>
            <SendDialog
              button={
                <Button size="sm">
                  <Send className="size-4 mr-1.5" />
                  Send
                </Button>
              }
              voucherAddress={voucher.voucher_address as `0x${string}`}
            />
          </div>
        </div>
      </div>

      {/* Mobile Action Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="text-center">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="border-2 shadow-sm size-16">
                <AvatarImage
                  asChild
                  src={voucher?.icon_url ?? "/apple-touch-icon.png"}
                >
                  <Image
                    src={voucher?.icon_url ?? "/apple-touch-icon.png"}
                    alt={`${voucher.voucher_name} icon`}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </AvatarImage>
                <AvatarFallback className="text-lg font-bold">
                  {voucher.voucher_name?.substring(0, 2).toLocaleUpperCase()}
                </AvatarFallback>
              </Avatar>
              <DrawerTitle>{voucher.voucher_name}</DrawerTitle>
              <p className="text-xl font-bold">
                {balance?.formatted ?? "0"} {voucher.symbol}
              </p>
            </div>
          </DrawerHeader>
          <div className="p-4 pb-8 flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleViewVoucher}
            >
              <Eye className="size-4 mr-2" />
              View Voucher
            </Button>
            <SendDialog
              button={
                <Button className="w-full">
                  <Send className="size-4 mr-2" />
                  Send
                </Button>
              }
              voucherAddress={voucher.voucher_address as `0x${string}`}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
