"use client";

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
import Address from "~/components/address";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useAuth } from "~/hooks/useAuth";
import { trpc, type RouterOutputs } from "~/lib/trpc";
import { celoscanUrl } from "~/utils/celo";
import { toUserUnitsString } from "~/utils/units";
import { useVoucherDetails } from "../pools/hooks";

type Event = RouterOutputs["transaction"]["events"]["events"][number];

type EventProps = {
  event: Event;
};

export function TransactionList({ events }: { events?: Event[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No transactions found.
      </div>
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
    <div className="space-y-4">
      {filteredEvents.map((event, index) => (
        <TransactionListItem key={index} event={event} />
      ))}
    </div>
  );
}

export function TransactionListItem({ event }: EventProps) {
  const auth = useAuth();
  const { data: vouchers } = trpc.voucher.list.useQuery();

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
      className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md transition-colors hover:bg-gray-50"
      onClick={() => {
        console.log(event);
      }}
    >
      <div className="flex items-center space-x-4">
        <Link
          href={`/vouchers/${
            tokenOutVoucher?.voucher_address ?? tokenInVoucher?.voucher_address
          }`}
          className="relative"
        >
          <Avatar className="w-12 h-12 shadow-sm">
            <AvatarImage
              src={
                tokenOutVoucher?.icon_url ||
                tokenInVoucher?.icon_url ||
                "/apple-touch-icon.png"
              }
              alt={symbol || "Token"}
            />
            <AvatarFallback>{symbol?.slice(0, 2) || "TK"}</AvatarFallback>
          </Avatar>
          {event.event_type === "pool_swap" && (
            <div className="absolute -top-2 -left-2">
              <Avatar className="w-8 h-8 shadow-lg">
                <AvatarImage
                  src={tokenInVoucher?.icon_url || "/apple-touch-icon.png"}
                  alt={tokenInVoucher?.symbol || "Token"}
                />
                <AvatarFallback>
                  {tokenInVoucher?.symbol?.slice(0, 2) || "TK"}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </Link>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">{eventTypeIcon}</span>
            <span className="text-sm font-medium text-gray-900">
              {eventTypeLabel}
            </span>
          </div>
          {event.event_type === "pool_swap" && (
            <div className="flex items-center space-x-1 mt-1">
              <TokenBadge address={event.token_in_address as `0x${string}`} />
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <TokenBadge address={event.token_out_address as `0x${string}`} />
            </div>
          )}
          <div className="mt-1 text-sm text-gray-500">
            <Address forceTruncate address={counterpartyAddress ?? ""} />
          </div>
          <div className="mt-2 text-xs text-gray-400">
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
            <div className="flex items-center space-x-1 text-sm font-semibold text-gray-400">
              <span>-</span>
              <span>
                {toUserUnitsString(
                  BigInt(event.token_in_value || "0"),
                  tokenInDetails?.decimals
                )}
              </span>
              <span className="font-normal text-gray-500">
                {tokenInDetails?.symbol}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-sm font-semibold text-green-500">
              <span>+</span>
              <span>
                {toUserUnitsString(
                  BigInt(event.token_out_value || "0"),
                  tokenOutDetails?.decimals
                )}
              </span>
              <span className="font-normal text-gray-500">
                {tokenOutDetails?.symbol}
              </span>
            </div>
          </>
        ) : (
          <div
            className={`flex items-center space-x-1 text-lg font-semibold ${
              isReceived ? "text-green-500" : "text-gray-400"
            }`}
          >
            <span>{isReceived ? "+" : "-"}</span>
            <span>{amountFormatted}</span>
            <span className="text-sm font-normal text-gray-500">{symbol}</span>
          </div>
        )}

        {event.tx_hash && (
          <Link
            href={celoscanUrl.tx(event.tx_hash)}
            target="_blank"
            className="mt-2 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            View Transaction <ExternalLink className="w-3 h-3" />
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
    token_transfer: <ArrowRight className="w-4 h-4" />,
    token_mint: <Plus className="w-4 h-4" />,
    token_burn: <Flame className="w-4 h-4" />,
    pool_deposit: <ArrowUpRight className="w-4 h-4" />,
    pool_swap: <RefreshCw className="w-4 h-4" />,
    faucet_give: <Gift className="w-4 h-4" />,
  };
  return icons[eventType] || null;
}

// Component to display token badge
function TokenBadge({ address }: { address: `0x${string}` }) {
  const { data: details } = useVoucherDetails(address);
  return (
    <span className="px-2 py-1 text-xs font-semibold text-white bg-gray-400 rounded-full">
      {details?.symbol || "Unknown"}
    </span>
  );
}
