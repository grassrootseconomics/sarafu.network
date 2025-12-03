"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";
import {
  SharedTransactionItem,
  TransactionSkeleton,
  type TransactionEvent,
} from "./shared-transaction-item";

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
          <TransactionSkeleton key={i} />
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
            key={`${event.tx_hash}-${index}`}
            variants={itemVariants}
            transition={{ duration: 0.2 }}
            layout
          >
            <SharedTransactionItem event={event as TransactionEvent} />
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

/**
 * @deprecated Use SharedTransactionItem instead
 * This export is kept for backward compatibility
 */
export { SharedTransactionItem as TransactionListItem };
