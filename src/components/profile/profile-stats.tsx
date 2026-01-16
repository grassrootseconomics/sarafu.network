"use client";

import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";

// Apple-like spring animations
const appleSpring = {
  gentle: { type: "spring" as const, stiffness: 100, damping: 20 },
  snappy: { type: "spring" as const, stiffness: 300, damping: 30 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: appleSpring.gentle,
  },
};

/**
 * User statistics data structure returned from tRPC
 */
export interface UserStats {
  uniquePartnersOutward: number;
  uniquePartnersInward: number;
  transactionsOut: number;
  transactionsIn: number;
  voucherBalances: VoucherBalance[];
  totalSwaps: number;
}

/**
 * Voucher balance information
 */
export interface VoucherBalance {
  voucherAddress: string;
  symbol: string;
  balance: string;
  decimals: number;
}

/**
 * ProfileStats component props
 */
export interface ProfileStatsProps {
  address: string;
}

/**
 * ProfileStats - Main container component with modern styling
 *
 * Features:
 * - Modern gradient backgrounds and rounded corners
 * - Framer Motion animations
 * - Responsive 2x2 grid layout
 * - Enhanced hover effects and transitions
 * - Premium card design with icons
 * - Sub-stats with directional indicators
 */
export function ProfileStats({ address }: ProfileStatsProps) {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = trpc.profile.getUserStats.useQuery(
    { address },
    { enabled: Boolean(address) }
  );

  if (isLoading) {
    return <ProfileStatsSkeleton />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={appleSpring.gentle}
        className="bg-card/60 backdrop-blur-sm border border-border/20 rounded-2xl md:rounded-3xl p-10 md:p-14"
      >
        <div className="text-center">
          <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground/30 mb-5" />
          <p className="text-base font-medium text-muted-foreground mb-5">
            Unable to load statistics
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="rounded-full px-6 border-border/40 hover:border-border"
          >
            Try Again
          </Button>
        </div>
      </motion.div>
    );
  }

  if (!stats) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={appleSpring.gentle}
        className="bg-card/60 backdrop-blur-sm border border-border/20 rounded-2xl md:rounded-3xl p-10 md:p-14"
      >
        <div className="text-center">
          <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground/30 mb-5" />
          <p className="text-base text-muted-foreground/60">No statistics available</p>
        </div>
      </motion.div>
    );
  }

  const totalTransactions = stats.transactionsIn + stats.transactionsOut;
  const totalTradingPartners =
    stats.uniquePartnersInward + stats.uniquePartnersOutward;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3"
    >
      <StatCard
        icon={<Users className="w-4 h-4" />}
        iconColor="text-primary"
        label="Partners"
        value={totalTradingPartners}
        subStats={[
          { label: "in", value: stats.uniquePartnersInward, isIncoming: true },
          { label: "out", value: stats.uniquePartnersOutward, isIncoming: false },
        ]}
      />
      <StatCard
        icon={<TrendingUp className="w-4 h-4" />}
        iconColor="text-emerald-500"
        label="Transactions"
        value={totalTransactions}
        subStats={[
          { label: "in", value: stats.transactionsIn, isIncoming: true },
          { label: "out", value: stats.transactionsOut, isIncoming: false },
        ]}
      />
      <StatCard
        icon={<RefreshCw className="w-4 h-4" />}
        iconColor="text-blue-500"
        label="Swaps"
        value={stats.totalSwaps}
      />
      <StatCard
        icon={<Wallet className="w-4 h-4" />}
        iconColor="text-purple-500"
        label="Holdings"
        value={stats.totalVouchersHeld}
      />
    </motion.div>
  );
}

/**
 * Stat card component props
 */
export interface StatCardProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: number;
  subStats?: { label: string; value: number; isIncoming: boolean }[];
}


export function StatCard({
  icon,
  iconColor,
  label,
  value,
  subStats,
}: StatCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -2 }}
      transition={appleSpring.snappy}
      className={cn(
        "bg-card/50",
        "border border-border/15",
        "rounded-xl",
        "p-3",
        "group"
      )}
    >
      {/* Header - Icon and label inline */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={cn(iconColor, "opacity-60 [&>svg]:w-4 [&>svg]:h-4")}>
          {icon}
        </div>
        <p className="text-xs font-medium text-muted-foreground/70">
          {label}
        </p>
      </div>

      {/* Value */}
      <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        {value.toLocaleString()}
      </p>

      {/* Sub-stats - Compact inline */}
      {subStats && subStats.length > 0 && (
        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground/60">
          {subStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-1">
              {stat.isIncoming ? (
                <ArrowDownLeft className="w-3 h-3 text-emerald-500/60" />
              ) : (
                <ArrowUpRight className="w-3 h-3 text-muted-foreground/40" />
              )}
              <span
                className={cn(
                  "tabular-nums",
                  stat.isIncoming ? "text-emerald-600/70" : "text-muted-foreground/60"
                )}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/**
 * ProfileStatsSkeleton - Loading state with matching layout
 *
 * Features:
 * - Matches final component structure
 * - Animated pulse effect
 * - Same grid layout as actual content
 */
export function ProfileStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={cn(
            "bg-card/50",
            "border border-border/15",
            "rounded-xl",
            "p-3"
          )}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <Skeleton className="h-7 w-12 rounded" />
          <div className="flex items-center gap-2 mt-1.5">
            <Skeleton className="h-3 w-8 rounded" />
            <Skeleton className="h-3 w-8 rounded" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
