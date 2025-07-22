"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Flame,
  Gift,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type JSX } from "react";
import Address from "~/components/address";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useAuth } from "~/hooks/useAuth";
import { trpc, type RouterOutputs } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { celoscanUrl } from "~/utils/celo";
import { toUserUnitsString } from "~/utils/units";
import { useVoucherDetails } from "../pools/hooks";

type Event = RouterOutputs["me"]["events"]["events"][number];

type EventProps = {
  event: Event;
};

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function TransactionList() {
  const auth = useAuth();
  const observerRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    trpc.me.events.useInfiniteQuery(
      {
        limit: 20,
      },
      {
        enabled: Boolean(auth?.session?.address),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage)
          void fetchNextPage();
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const events = data?.pages.flatMap((page) => page.events) ?? [];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-card rounded-lg border animate-pulse"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-muted rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-6 w-24 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          </div>
        ))}
      </motion.div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg"
      >
        No transactions found.
      </motion.div>
    );
  }

  // Get all tx_hashes from pool_swap events
  const swapTxHashes = new Set(
    events
      .filter((event) => event.event_type === "pool_swap")
      .map((event) => event.tx_hash)
  );

  // Filter out token_transfers that share tx_hash with pool_swaps
  const filteredEvents = events.filter(
    (event) =>
      event.event_type !== "token_transfer" ||
      !event.tx_hash ||
      !swapTxHashes.has(event.tx_hash)
  );

  return (
    <motion.div
      variants={listVariants}
      initial="show"
      animate="show"
      className="space-y-3"
    >
      <AnimatePresence mode="popLayout">
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.tx_hash ?? index}
            variants={itemVariants}
            transition={{ duration: 0.2 }}
            layout
          >
            <TransactionListItem event={event} />
          </motion.div>
        ))}
      </AnimatePresence>

      <div ref={observerRef} className="h-2" />

      {isFetchingNextPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center py-4 text-muted-foreground"
        >
          <Loader2 className="size-5 animate-spin mr-2" />
          Loading more...
        </motion.div>
      )}
    </motion.div>
  );
}

export function TransactionListItem({ event }: EventProps) {
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
  const userAddress = auth?.session?.address?.toLowerCase();
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

  // Parse the event date
  const eventDate = new Date(event.date_block || "");

  return (
    <div
      className={cn(
        "group flex items-center justify-between p-4",
        "bg-card rounded-lg border",
        "transition-all duration-200",
        "hover:bg-accent/5 hover:shadow-md"
      )}
    >
      <div className="flex items-center space-x-4">
        <Link
          href={`/vouchers/${
            tokenOutVoucher?.voucher_address ?? tokenInVoucher?.voucher_address
          }`}
          className="relative"
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
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">{eventTypeIcon}</span>
            <span className="font-medium">{eventTypeLabel}</span>
          </div>
          {event.event_type === "pool_swap" && (
            <div className="flex items-center space-x-1 mt-1">
              <TokenBadge address={event.token_in_address as `0x${string}`} />
              <ArrowRight className="size-4 text-muted-foreground" />
              <TokenBadge address={event.token_out_address as `0x${string}`} />
            </div>
          )}
          <div className="mt-1 text-sm text-muted-foreground">
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
      <div className="flex flex-col items-end justify-center">
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
          >
            View Transaction <ExternalLink className="size-3" />
          </Link>
        )}
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
