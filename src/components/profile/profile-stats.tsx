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
    <div className="space-y-8">
      {/* Main Statistics Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
      >
        {/* Trading Partners Card */}
        <StatCard
          icon={<Users className="w-6 h-6" />}
          iconColor="text-primary"
          label="Trading Partners"
          value={totalTradingPartners}
          subStats={[
            {
              label: "received",
              value: stats.uniquePartnersInward,
              isIncoming: true,
            },
            {
              label: "sent",
              value: stats.uniquePartnersOutward,
              isIncoming: false,
            },
          ]}
        />

        {/* Total Transactions Card */}
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          iconColor="text-emerald-500"
          label="Transactions"
          value={totalTransactions}
          subStats={[
            {
              label: "in",
              value: stats.transactionsIn,
              isIncoming: true,
            },
            {
              label: "out",
              value: stats.transactionsOut,
              isIncoming: false,
            },
          ]}
        />

        {/* Total Swaps Card */}
        <StatCard
          icon={<RefreshCw className="w-6 h-6" />}
          iconColor="text-blue-500"
          label="Swaps"
          value={stats.totalSwaps}
        />

        {/* Voucher Holdings Card */}
        <StatCard
          icon={<Wallet className="w-6 h-6" />}
          iconColor="text-purple-500"
          label="Holdings"
          value={stats.totalVouchersHeld}
        />
      </motion.div>
    </div>
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
      whileHover={{ y: -4 }}
      transition={appleSpring.snappy}
      className={cn(
        "bg-card/60 backdrop-blur-sm",
        "border border-border/20",
        "rounded-2xl md:rounded-3xl",
        "p-6 md:p-8",
        "shadow-sm hover:shadow-lg hover:shadow-black/5",
        "transition-shadow duration-500",
        "group"
      )}
    >
      {/* Icon - Minimal, no background */}
      <div className="mb-5">
        <div className={cn(iconColor, "opacity-50")}>
          {icon}
        </div>
      </div>

      {/* Value - Large, light weight */}
      <motion.p
        className="text-5xl md:text-6xl font-light tracking-tight tabular-nums text-foreground mb-2"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={appleSpring.gentle}
      >
        {value.toLocaleString()}
      </motion.p>

      {/* Label - Uppercase, subtle */}
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-4">
        {label}
      </p>

      {/* Sub-stats - Refined */}
      {subStats && subStats.length > 0 && (
        <div className="flex flex-wrap items-center gap-5 pt-5 border-t border-border/10">
          {subStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              {stat.isIncoming ? (
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500/70 shrink-0" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              )}
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  stat.isIncoming ? "text-emerald-600/80" : "text-muted-foreground"
                )}
              >
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground/50">
                {stat.label}
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
    <div className="space-y-8">
      {/* Main Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "bg-card/60 backdrop-blur-sm",
              "border border-border/20",
              "rounded-2xl md:rounded-3xl",
              "p-6 md:p-8"
            )}
          >
            <Skeleton className="w-6 h-6 mb-5 rounded" />
            <Skeleton className="h-14 w-28 mb-3 rounded-lg" />
            <Skeleton className="h-3 w-24 mb-5 rounded" />
            <div className="flex items-center gap-4 pt-5 border-t border-border/10">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
