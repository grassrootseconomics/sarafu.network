import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

/**
 * Profile page loading skeleton
 *
 * Displays a loading state that matches the profile layout structure:
 * - Header section with avatar, name, and action buttons
 * - Tabs navigation
 * - Content area with placeholder items
 */
export function ProfileSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Header Skeleton */}
      <div className="w-full bg-card rounded-lg border shadow-sm">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            {/* Avatar and Name Section */}
            <div className="flex items-start gap-4">
              <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Address Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10 flex-shrink-0" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-auto">
          <TabsTrigger value="transactions" className="text-xs sm:text-sm py-2">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="text-xs sm:text-sm py-2">
            Vouchers
          </TabsTrigger>
          <TabsTrigger value="pools" className="text-xs sm:text-sm py-2">
            Pools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <TransactionItemSkeleton key={i} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vouchers" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <VoucherCardSkeleton key={i} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pools" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <PoolCardSkeleton key={i} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Transaction list item skeleton
 */
function TransactionItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
      <div className="flex items-center space-x-4 flex-1">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2 items-end flex flex-col">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/**
 * Voucher card skeleton
 */
function VoucherCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

/**
 * Pool card skeleton
 */
function PoolCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
