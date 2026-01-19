"use client";

import { motion } from "framer-motion";
import { Waves } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
 * Props for UserPoolList component
 */
interface UserPoolListProps {
  /** User's wallet address */
  address: string;
  /** Whether viewing own profile - shows create link in empty state */
  isOwnProfile?: boolean;
}

/**
 * User pool list component displaying pools where the user has interacted
 *
 * Features:
 * - Fetches user pools via tRPC
 * - Grid layout with responsive columns
 * - Pool cards with banner, name, symbol, and description
 * - Links to pool detail pages
 * - Loading states
 * - Empty state
 */
export function UserPoolList({ address, isOwnProfile = false }: UserPoolListProps) {
  const { data: pools, isLoading, error } = trpc.profile.getUserPools.useQuery(
    { address },
    { enabled: Boolean(address) }
  ) as { data: Pool[] | undefined; isLoading: boolean; error: Error | null };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {[1, 2, 3].map((i) => (
          <PoolCardSkeleton key={i} index={i} />
        ))}
      </div>
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
        <Waves className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-base text-muted-foreground">
          Unable to load pools
        </p>
      </motion.div>
    );
  }

  if (!pools || pools.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={appleSpring.gentle}
        className="text-center py-16 bg-card/60 backdrop-blur-sm border border-border/20 rounded-2xl md:rounded-3xl"
      >
        <Waves className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-lg font-medium text-muted-foreground mb-1">
          {isOwnProfile ? "You don't have any pools yet" : "No pools"}
        </p>
        <p className="text-sm text-muted-foreground/60 mb-4">
          {isOwnProfile
            ? "Create your first swap pool to get started"
            : "This user hasn't created any swap pools"}
        </p>
        {isOwnProfile && (
          <Button asChild variant="outline">
            <Link href="/pools/create">Create Pool</Link>
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
    >
      {pools.map((pool) => (
        <PoolCard key={pool.contract_address} pool={pool} />
      ))}
    </motion.div>
  );
}

/**
 * Pool type inferred from tRPC router output
 */
type Pool = {
  contract_address: string;
  pool_name: string;
  pool_symbol: string;
  description: string;
  banner_url: string | null;
};

/**
 * Pool card component props
 */
interface PoolCardProps {
  pool: Pool;
}

/**
 * Pool card component
 */
function PoolCard({ pool }: PoolCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -6 }}
      transition={appleSpring.snappy}
    >
      <Link href={`/pools/${pool.contract_address}`}>
        <div
          className={cn(
            "group overflow-hidden h-full flex flex-col",
            "bg-card/60 backdrop-blur-sm",
            "border border-border/20",
            "rounded-2xl md:rounded-3xl",
            "shadow-sm hover:shadow-xl hover:shadow-black/5",
            "transition-shadow duration-500"
          )}
        >
          {/* Pool Banner */}
          <div className="relative h-44 md:h-52 w-full overflow-hidden bg-muted">
            <Image
              src={pool.banner_url ?? "/pools/pool-default.webp"}
              alt={pool.pool_name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Pool Info */}
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <h3 className="text-xl font-semibold tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-300 mb-2">
              {pool.pool_name}
            </h3>
            <p className="text-sm text-muted-foreground/60 mb-4">{pool.pool_symbol}</p>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {pool.description || "No description available"}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * Pool card loading skeleton
 */
function PoolCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 0.7, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "overflow-hidden h-full flex flex-col",
        "bg-card/60 backdrop-blur-sm",
        "border border-border/20",
        "rounded-2xl md:rounded-3xl"
      )}
    >
      <Skeleton className="h-44 md:h-52 w-full rounded-none" />
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <Skeleton className="h-6 w-3/4 mb-3 rounded" />
        <Skeleton className="h-4 w-1/3 mb-5 rounded" />
        <Skeleton className="h-4 w-full mb-2 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>
    </motion.div>
  );
}
