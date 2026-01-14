"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { trpc } from "~/lib/trpc";
import {
  SharedTransactionItem,
  TransactionSkeleton,
  type TransactionEvent,
} from "../transactions/shared-transaction-item";

/**
 * Props for UserTransactionList component
 */
interface UserTransactionListProps {
  /** User's wallet address */
  address: string;
}

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

/**
 * User transaction list component with infinite scroll
 *
 * Features:
 * - Fetches user transactions via tRPC
 * - Infinite scroll pagination
 * - Loading states with skeletons
 * - Empty state
 * - Transaction details with amount, token, and timestamp
 * - Filters out token_transfer events that are part of pool_swap transactions
 */
export function UserTransactionList({ address }: UserTransactionListProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = trpc.profile.getUserTransactions.useInfiniteQuery(
    {
      address,
      limit: 20,
    },
    {
      enabled: Boolean(address),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const allTransactions =
    data?.pages.flatMap((page) => page.transactions) ?? [];

  // Get all tx_hashes from pool_swap events
  const swapTxHashes = new Set(
    allTransactions
      .filter((tx) => tx.event_type === "pool_swap")
      .map((tx) => tx.tx_hash)
  );

  // Filter out token_transfers that share tx_hash with pool_swaps
  const filteredTransactions = allTransactions.filter(
    (tx) =>
      tx.event_type !== "token_transfer" ||
      !tx.tx_hash ||
      !swapTxHashes.has(tx.tx_hash)
  );

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <TransactionSkeleton key={i} />
        ))}
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 bg-muted/10 rounded-lg"
      >
        <p className="text-muted-foreground">
          Failed to load transactions. Please try again later.
        </p>
      </motion.div>
    );
  }

  if (!filteredTransactions || filteredTransactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 bg-muted/10 rounded-lg"
      >
        <p className="text-muted-foreground">No transactions found.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={listVariants}
      initial="show"
      animate="show"
      className="space-y-3"
    >
      <AnimatePresence mode="popLayout">
        {filteredTransactions.map((tx, index) => (
          <motion.div
            key={`${tx.tx_hash}-${index}`}
            variants={itemVariants}
            transition={{ duration: 0.2 }}
            layout
          >
            <SharedTransactionItem
              event={tx as TransactionEvent}
              userAddress={address}
            />
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
