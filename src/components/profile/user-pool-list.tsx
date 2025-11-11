"use client";

import { Waves } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";

/**
 * Props for UserPoolList component
 */
interface UserPoolListProps {
  /** User's wallet address */
  address: string;
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
export function UserPoolList({ address }: UserPoolListProps) {
  const { data: pools, isLoading, error } = trpc.profile.getUserPools.useQuery(
    { address },
    { enabled: Boolean(address) }
  ) as { data: Pool[] | undefined; isLoading: boolean; error: Error | null };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <PoolCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-muted/10 rounded-lg">
        <Waves className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          Failed to load pools. Please try again later.
        </p>
      </div>
    );
  }

  if (!pools || pools.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/10 rounded-lg">
        <Waves className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground text-lg font-medium mb-2">
          No pools yet
        </p>
        <p className="text-sm text-muted-foreground/80">
          This user hasn&apos;t created any swap pools
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pools.map((pool) => (
        <PoolCard key={pool.contract_address} pool={pool} />
      ))}
    </div>
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
    <Link href={`/pools/${pool.contract_address}`}>
      <Card
        className={cn(
          "group overflow-hidden transition-all duration-200",
          "hover:shadow-lg hover:border-primary/50",
          "h-full flex flex-col"
        )}
      >
        {/* Pool Banner */}
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          <Image
            src={pool.banner_url ?? "/pools/pool-default.webp"}
            alt={pool.pool_name}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>

        {/* Pool Info */}
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
            {pool.pool_name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{pool.pool_symbol}</p>
        </CardHeader>

        <CardContent className="pt-0 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {pool.description || "No description available"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Pool card loading skeleton
 */
function PoolCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Skeleton className="h-40 w-full" />
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="pt-0 flex-1">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}
