"use client";

import { Coins } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { UserVoucherBalanceList } from "~/components/voucher/user-voucher-balance-list";
import { trpc } from "~/lib/trpc";

/**
 * Props for UserVoucherGrid component
 */
interface UserVoucherGridProps {
  /** User's wallet address */
  address: string;
}

/**
 * User voucher grid component displaying vouchers associated with the user
 *
 * Features:
 * - Fetches user vouchers via tRPC
 * - Shows voucher balances with search and sort
 * - List view with balance information
 * - Links to voucher detail pages
 * - Loading skeletons
 * - Empty state
 */
export function UserVoucherGrid({ address }: UserVoucherGridProps) {
  const {
    data: vouchers,
    isLoading,
    error,
  } = trpc.profile.getUserOwnedVouchers.useQuery(
    { address },
    { enabled: Boolean(address) }
  );

  if (isLoading) {
    return (
      <div className="space-y-3 px-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg animate-pulse"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-muted/10 rounded-lg">
        <Coins className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          Failed to load vouchers. Please try again later.
        </p>
      </div>
    );
  }

  if (!vouchers || vouchers.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/10 rounded-lg">
        <Coins className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground text-lg font-medium mb-2">
          No vouchers yet
        </p>
        <p className="text-sm text-muted-foreground/80">
          This user doesn&apos;t have any vouchers
        </p>
      </div>
    );
  }

  return (
    <UserVoucherBalanceList
      vouchers={vouchers}
      address={address as `0x${string}`}
    />
  );
}
