import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Eye, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { type TokenValue } from "~/utils/units";
import { SendDialog } from "../dialogs/send-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

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

const expandAnimation = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.2, ease: "easeInOut" },
} as const;

function truncateWithEllipsis(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

export function UserVoucherBalanceItem({
  voucher,
  balance,
}: UserVoucherBalanceItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const truncatedName = truncateWithEllipsis(voucher.voucher_name || "", 15);
  const shouldShowTooltip = (voucher.voucher_name?.length || 0) > 15;

  return (
    <motion.div
      layout
      className={cn(
        "group relative flex flex-col justify-between w-full",
        "bg-card rounded-lg border",
        "transition-all duration-200",
        "hover:bg-accent/5 hover:shadow-md",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center w-full",
          "text-left cursor-pointer",
          "focus-visible:outline-none",
          "transition-colors duration-200",
          "p-3 sm:p-4 gap-2 sm:gap-4",
          isExpanded && "bg-accent/5"
        )}
        aria-expanded={isExpanded}
        aria-controls={`voucher-details-${voucher.id}`}
      >
        <Avatar className="border shadow-sm group-hover:shadow-md transition-shadow shrink-0 size-10 sm:size-12">
          <AvatarImage
            asChild
            src={voucher?.icon_url ?? "/apple-touch-icon.png"}
          >
            <Image
              src={voucher?.icon_url ?? "/apple-touch-icon.png"}
              alt={`${voucher.voucher_name} icon`}
              width={24}
              height={24}
              className="object-cover"
            />
          </AvatarImage>
          <AvatarFallback>
            {voucher.voucher_name?.substring(0, 2).toLocaleUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 max-w-[30%] sm:max-w-[40%]">
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <p className="text-base sm:text-lg font-semibold leading-none truncate">
                  {shouldShowTooltip ? truncatedName : voucher.voucher_name}
                </p>
              </TooltipTrigger>
              {shouldShowTooltip && (
                <TooltipContent
                  side="top"
                  className="max-w-[200px] break-words"
                >
                  <p>{voucher.voucher_name}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground truncate">
            {voucher.symbol}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          <motion.p
            layout
            className="text-base sm:text-lg font-medium tabular-nums truncate max-w-[100px] sm:max-w-[140px]"
          >
            {balance?.formatted ?? "0"}
          </motion.p>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0"
          >
            <ChevronDown className="size-4 sm:size-5" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            {...expandAnimation}
            id={`voucher-details-${voucher.id}`}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.1 }}
              className="p-3 sm:px-4 sm:pb-4 sm:pt-1 flex flex-col sm:flex-row justify-end gap-2"
            >
              <Link
                href={`/vouchers/${voucher?.voucher_address ?? ""}`}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  className="w-full sm:w-auto shadow-sm hover:shadow transition-shadow duration-200"
                >
                  <Eye className="size-4 mr-2" />
                  View
                </Button>
              </Link>
              <SendDialog
                button={
                  <Button className="w-full sm:w-auto shadow-sm hover:shadow transition-shadow duration-200">
                    <Send className="size-4 mr-2" />
                    Send
                  </Button>
                }
                voucherAddress={voucher.voucher_address as `0x${string}`}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
