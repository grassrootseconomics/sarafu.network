"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Flame,
  Gift,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { type JSX } from "react";
import Address from "~/components/address";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { celoscanUrl } from "~/utils/celo";
import { toUserUnitsString } from "~/utils/units/token";
import { useVoucherDetails } from "../pools/hooks";

/**
 * Transaction event type from the API (me.events endpoint)
 */
export type TransactionEvent = {
  tx_hash: string;
  date_block: Date | string;
  event_type: string;
  from_address?: string | null;
  to_address?: string | null;
  token_in_address?: string | null;
  token_out_address?: string | null;
  token_in_value?: string | null;
  token_out_value?: string | null;
};

/**
 * Simple transfer type from profile.getUserTransactions endpoint
 */
export type SimpleTransfer = {
  tx_hash: string;
  date_block: Date;
  success: boolean;
  voucher_address: string;
  sender_address: string;
  recipient_address: string;
  transfer_value: string;
};

/**
 * Props for SharedTransactionItem component
 */
interface SharedTransactionItemProps {
  event: TransactionEvent;
  /** Optional override for user address (defaults to authenticated user) */
  userAddress?: string;
}


/**
 * Shared transaction list item component
 *
 * Used by both:
 * - TransactionList (authenticated user's transactions)
 * - UserTransactionList (public profile transactions)
 *
 * Features:
 * - Shows transaction type with icon
 * - Displays counterparty address
 * - Shows amount with +/- indicator
 * - Links to voucher and block explorer
 * - Handles swaps with dual tokens
 */
export function SharedTransactionItem({
  event,
  userAddress: overrideUserAddress,
}: SharedTransactionItemProps) {
  const auth = useAuth();
  const { data: vouchers } = trpc.voucher.list.useQuery({});

  // Find the vouchers associated with the event
  const tokenOutVoucher = vouchers?.find(
    (v) => v.voucher_address === event.token_out_address
  );
  const tokenInVoucher = vouchers?.find(
    (v) => v.voucher_address === event.token_in_address
  );

  // Fetch voucher details
  const { data: tokenOutDetails } = useVoucherDetails(
    event.token_out_address as `0x${string}`
  );
  const { data: tokenInDetails } = useVoucherDetails(
    event.token_in_address as `0x${string}`
  );

  // Determine if the user is the recipient
  const userAddress =
    overrideUserAddress?.toLowerCase() ?? auth?.session?.address?.toLowerCase();
  const isReceived =
    userAddress === event.to_address?.toLowerCase() ||
    event.event_type === "token_mint" ||
    event.event_type === "faucet_give";

  // Determine the counterparty address
  const counterpartyAddress = isReceived
    ? event.from_address
    : event.to_address;

  // Get event type label and icon
  const eventTypeLabel = getEventTypeLabel(event.event_type);
  const eventTypeIcon = getEventTypeIcon(event.event_type);

  // Format the amount
  const amount = isReceived ? event.token_in_value : event.token_out_value;

  const amountFormatted = toUserUnitsString(
    BigInt(amount || "0"),
    isReceived ? tokenInDetails?.decimals : tokenOutDetails?.decimals
  );

  // Get the token symbol
  const symbol = isReceived
    ? tokenInDetails?.symbol || tokenInVoucher?.symbol
    : tokenOutDetails?.symbol || tokenOutVoucher?.symbol;

  const eventDate =
    typeof event.date_block === "string"
      ? new Date(event.date_block)
      : event.date_block;

  return (
    <div
      className={cn(
        "group flex items-center justify-between p-4",
        "bg-card rounded-lg border",
        "transition-all duration-200",
        "hover:bg-accent/5 hover:shadow-md"
      )}
    >
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <Link
          href={`/vouchers/${
            tokenOutVoucher?.voucher_address ?? tokenInVoucher?.voucher_address
          }`}
          className="relative flex-shrink-0"
        >
          <Avatar className="w-12 h-12 border shadow-sm group-hover:shadow-md transition-shadow">
            <AvatarImage
              src={
                event.event_type === "pool_swap"
                  ? tokenOutVoucher?.icon_url || "/apple-touch-icon.png"
                  : tokenInVoucher?.icon_url || "/apple-touch-icon.png"
              }
              alt={symbol || "Token"}
            />
            <AvatarFallback>{symbol?.slice(0, 2) || "TK"}</AvatarFallback>
          </Avatar>
          {event.event_type === "pool_swap" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -left-2"
            >
              <Avatar className="w-8 h-8 border shadow-lg">
                <AvatarImage
                  src={tokenInVoucher?.icon_url || "/apple-touch-icon.png"}
                  alt={tokenInVoucher?.symbol || "Token"}
                />
                <AvatarFallback>
                  {tokenInVoucher?.symbol?.slice(0, 2) || "TK"}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">{eventTypeIcon}</span>
            <span className="font-medium text-sm">{eventTypeLabel}</span>
          </div>

          {event.event_type === "pool_swap" && (
            <div className="flex items-center space-x-1 mt-1">
              <TokenBadge address={event.token_in_address as `0x${string}`} />
              <ArrowRight className="size-4 text-muted-foreground" />
              <TokenBadge address={event.token_out_address as `0x${string}`} />
            </div>
          )}

          <div className="mt-1 text-sm text-muted-foreground truncate">
            <Address forceTruncate address={counterpartyAddress ?? ""} />
          </div>

          <div className="mt-2 text-xs text-muted-foreground/60">
            {eventDate.toLocaleString([], {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end justify-center ml-4 flex-shrink-0">
        {event.event_type === "pool_swap" ? (
          <>
            <div className="flex items-center space-x-1 text-sm font-medium text-muted-foreground">
              <span>-</span>
              <span className="tabular-nums">
                {toUserUnitsString(
                  BigInt(event.token_in_value || "0"),
                  tokenInDetails?.decimals
                )}
              </span>
              <span className="text-muted-foreground/60">
                {tokenInDetails?.symbol}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-sm font-medium text-emerald-500">
              <span>+</span>
              <span className="tabular-nums">
                {toUserUnitsString(
                  BigInt(event.token_out_value || "0"),
                  tokenOutDetails?.decimals
                )}
              </span>
              <span className="text-muted-foreground/60">
                {tokenOutDetails?.symbol}
              </span>
            </div>
          </>
        ) : (
          <div
            className={cn(
              "flex items-center space-x-1 text-lg font-medium tabular-nums",
              isReceived ? "text-emerald-500" : "text-muted-foreground"
            )}
          >
            <span>{isReceived ? "+" : "-"}</span>
            <span>{amountFormatted}</span>
            <span className="text-sm font-normal text-muted-foreground/60">
              {symbol}
            </span>
          </div>
        )}

        {event.tx_hash && (
          <Link
            href={celoscanUrl.tx(event.tx_hash)}
            target="_blank"
            className={cn(
              "mt-2 text-xs flex items-center gap-1",
              "text-muted-foreground/60 hover:text-foreground",
              "transition-colors duration-200"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            View <ExternalLink className="size-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Transaction loading skeleton
 * Reusable skeleton for transaction items
 */
export function TransactionSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
      <div className="flex items-center space-x-4 flex-1">
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2 flex-shrink-0">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// Helper function to get event type label
function getEventTypeLabel(eventType: string): string {
  const labels: { [key: string]: string } = {
    token_transfer: "Transfer",
    token_mint: "Mint",
    token_burn: "Burn",
    pool_deposit: "Pool Deposit",
    pool_swap: "Swap",
    faucet_give: "Faucet",
  };
  return labels[eventType] || eventType;
}

// Helper function to get event type icon
function getEventTypeIcon(eventType: string): JSX.Element | null {
  const icons: { [key: string]: JSX.Element } = {
    token_transfer: <ArrowRight className="size-4" />,
    token_mint: <Plus className="size-4" />,
    token_burn: <Flame className="size-4" />,
    pool_deposit: <ArrowUpRight className="size-4" />,
    pool_swap: <RefreshCw className="size-4" />,
    faucet_give: <Gift className="size-4" />,
  };
  return icons[eventType] || null;
}

// Component to display token badge
function TokenBadge({ address }: { address: `0x${string}` }) {
  const { data: details } = useVoucherDetails(address);
  return (
    <span
      className={cn(
        "px-2 py-0.5 text-xs font-medium rounded-full",
        "bg-muted text-muted-foreground",
        "transition-colors duration-200"
      )}
    >
      {details?.symbol || "Unknown"}
    </span>
  );
}
