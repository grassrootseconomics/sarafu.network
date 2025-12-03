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
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";

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
      <div className="bg-gradient-to-br from-primary/5 via-background to-background border border-border rounded-2xl p-8">
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-destructive font-medium mb-4">
            Failed to load profile statistics
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gradient-to-br from-primary/5 via-background to-background border border-border rounded-2xl p-8">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No statistics available</p>
        </div>
      </div>
    );
  }

  const totalTransactions = stats.transactionsIn + stats.transactionsOut;
  const totalTradingPartners =
    stats.uniquePartnersInward + stats.uniquePartnersOutward;

  return (
    <div className="space-y-8">
      {/* Main Statistics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Trading Partners Card */}
        <StatCard
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
          label="Trading Partners"
          value={totalTradingPartners}
          subStats={[
            {
              label: "Received from",
              value: stats.uniquePartnersInward,
              isIncoming: true,
            },
            {
              label: "Sent to",
              value: stats.uniquePartnersOutward,
              isIncoming: false,
            },
          ]}
        />

        {/* Total Transactions Card */}
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          iconBgColor="bg-emerald-500/10"
          iconColor="text-emerald-500"
          label="Total Transactions"
          value={totalTransactions}
          subStats={[
            {
              label: "Incoming",
              value: stats.transactionsIn,
              isIncoming: true,
            },
            {
              label: "Outgoing",
              value: stats.transactionsOut,
              isIncoming: false,
            },
          ]}
        />

        {/* Total Swaps Card */}
        <StatCard
          icon={<RefreshCw className="w-6 h-6" />}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-500"
          label="Total Swaps"
          value={stats.totalSwaps}
        />

        {/* Voucher Holdings Card */}
        <StatCard
          icon={<Wallet className="w-6 h-6" />}
          iconBgColor="bg-purple-500/10"
          iconColor="text-purple-500"
          label="Voucher Holdings"
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
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: number;
  subStats?: { label: string; value: number; isIncoming: boolean }[];
}


export function StatCard({
  icon,
  iconBgColor,
  iconColor,
  label,
  value,
  subStats,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "bg-card border border-border/60",
        "rounded-lg sm:rounded-xl",
        "transition-all duration-200",
        "hover:border-border hover:shadow-sm",
        "group"
      )}
    >
      <div className="p-4 sm:p-5">
        {/* Header: Icon and Label */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              "flex items-center justify-center shrink-0",
              "w-9 h-9 sm:w-10 sm:h-10 rounded-lg",
              iconBgColor,
              "transition-transform duration-200",
              "group-hover:scale-105"
            )}
          >
            <div className={cn(iconColor, "w-4 h-4 sm:w-5 sm:h-5")}>
              {icon}
            </div>
          </div>

          {/* Label */}
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            {label}
          </p>
        </div>

        {/* Value */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-3"
        >
          <p className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-foreground">
            {value.toLocaleString()}
          </p>
        </motion.div>

        {/* Sub-stats */}
        {subStats && subStats.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3 border-t border-border/40">
            {subStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-1.5">
                {stat.isIncoming ? (
                  <ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground shrink-0" />
                )}
                <div className="text-xs whitespace-nowrap">
                  <span className="font-semibold tabular-nums text-foreground">
                    {stat.value}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="p-6 rounded-xl border border-border shadow-sm bg-gradient-to-br from-card via-card to-muted/20"
          >
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
            <Skeleton className="h-10 w-24 mb-2" />
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="flex items-center gap-4 pt-3 border-t border-border/50">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
