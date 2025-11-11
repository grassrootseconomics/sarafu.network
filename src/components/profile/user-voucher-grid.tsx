"use client";

import { Coins } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";

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
 * - Responsive grid layout (1-4 columns)
 * - Voucher cards with icon, symbol, and name
 * - Links to voucher detail pages
 * - Loading skeletons
 * - Empty state
 */
export function UserVoucherGrid({ address }: UserVoucherGridProps) {
  const { data: vouchers, isLoading, error } = trpc.profile.getUserVouchers.useQuery(
    { address },
    { enabled: Boolean(address) }
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <VoucherCardSkeleton key={i} />
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
          This user hasn&apos;t created any vouchers
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {vouchers.map((voucher) => (
        <VoucherCard key={voucher.voucher_address} voucher={voucher} />
      ))}
    </div>
  );
}

/**
 * Voucher card component props
 */
interface VoucherCardProps {
  voucher: {
    voucher_address: string;
    symbol: string;
    voucher_name: string;
    icon_url: string | null;
    voucher_type: string;
  };
}

/**
 * Voucher card component
 */
function VoucherCard({ voucher }: VoucherCardProps) {
  return (
    <Link href={`/vouchers/${voucher.voucher_address}`}>
      <Card
        className={cn(
          "group overflow-hidden transition-all duration-200",
          "hover:shadow-lg hover:border-primary/50",
          "h-full"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border shadow-sm group-hover:shadow-md transition-shadow">
              <AvatarImage
                asChild
                src={voucher.icon_url ?? "/apple-touch-icon.png"}
              >
                <Image
                  src={voucher.icon_url ?? "/apple-touch-icon.png"}
                  alt={voucher.symbol}
                  width={48}
                  height={48}
                />
              </AvatarImage>
              <AvatarFallback>
                {voucher.symbol.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                {voucher.symbol}
              </CardTitle>
              <p className="text-xs text-muted-foreground capitalize">
                {voucher.voucher_type.toLowerCase()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {voucher.voucher_name}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Voucher card loading skeleton
 */
function VoucherCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}
