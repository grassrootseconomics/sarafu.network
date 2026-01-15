"use client";

import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { UserVoucherBalanceList } from "~/components/voucher/user-voucher-balance-list";
import { trpc } from "~/lib/trpc";

// Apple-like spring animation
const appleSpring = {
  gentle: { type: "spring" as const, stiffness: 100, damping: 20 },
};

/**
 * Props for UserBalances component
 */
interface UserBalancesProps {
  /** User's wallet address */
  address: string;
}

/**
 * User balances component displaying vouchers held by the user
 *
 * Features:
 * - Fetches user vouchers via tRPC (getUserVouchers)
 * - Shows voucher balances with search and sort
 * - List view with balance information
 * - Loading skeletons
 * - Empty state
 */
export function UserBalances({ address }: UserBalancesProps) {
  const {
    data: vouchers,
    isLoading,
    error,
  } = trpc.profile.getUserVouchers.useQuery(
    { address },
    { enabled: Boolean(address) }
  );

  if (isLoading) {
    return (
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 p-5 bg-card/60 backdrop-blur-sm border border-border/20 rounded-2xl"
          >
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2.5 flex-1">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
            <Skeleton className="h-5 w-20 rounded" />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={appleSpring.gentle}
        className="text-center py-16 bg-card/60 backdrop-blur-sm border border-border/20 rounded-2xl md:rounded-3xl"
      >
        <Coins className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-base text-muted-foreground">
          Unable to load balances
        </p>
      </motion.div>
    );
  }

  if (!vouchers || vouchers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={appleSpring.gentle}
        className="text-center py-16 bg-card/60 backdrop-blur-sm border border-border/20 rounded-2xl md:rounded-3xl"
      >
        <Coins className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-lg font-medium text-muted-foreground mb-1">
          No balances
        </p>
        <p className="text-sm text-muted-foreground/60">
          This user doesn&apos;t hold any vouchers yet
        </p>
      </motion.div>
    );
  }

  return (
    <UserVoucherBalanceList
      vouchers={vouchers}
      address={address as `0x${string}`}
    />
  );
}
