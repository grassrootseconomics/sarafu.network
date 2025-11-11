"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { trpc } from "~/lib/trpc";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { ReportStatus } from "~/server/enums";
import { cn } from "~/lib/utils";

/**
 * Props for UserReportsList component
 */
interface UserReportsListProps {
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
 * User reports list component with infinite scroll
 *
 * Features:
 * - Fetches reports created by user via tRPC
 * - Infinite scroll pagination
 * - Loading states with skeletons
 * - Empty state
 * - Report cards with images, tags, and metadata
 */
export function UserReportsList({ address }: UserReportsListProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = trpc.profile.getUserReports.useInfiniteQuery(
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

  const allReports = data?.pages.flatMap((page) => page.reports) ?? [];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        {[1, 2, 3].map((i) => (
          <ReportSkeleton key={i} />
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
          Failed to load reports. Please try again later.
        </p>
      </motion.div>
    );
  }

  if (!allReports || allReports.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 bg-muted/10 rounded-lg"
      >
        <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground">No reports found.</p>
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
        {allReports.map((report) => (
          <motion.div
            key={report.id}
            variants={itemVariants}
            transition={{ duration: 0.2 }}
            layout
          >
            <ReportCard report={report} />
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

/**
 * Report card component
 */
interface ReportCardProps {
  report: {
    id: number;
    title: string;
    description: string | null;
    image_url: string | null;
    status: string;
    created_at: Date;
    updated_at: Date;
  };
}

function ReportCard({ report }: ReportCardProps) {
  const hasImage = Boolean(report.image_url);

  return (
    <Link
      href={`/reports/${report.id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
    >
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]">
        <div className="flex flex-col md:flex-row">
          {hasImage ? (
            <div className="w-full h-48 md:w-72 md:h-56 md:flex-shrink-0">
              <div className="relative w-full h-full">
                <Image
                  src={report.image_url!}
                  alt={`Image for ${report.title}`}
                  fill
                  className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                  sizes="(max-width: 768px) 100vw, 288px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ) : (
            <div className="hidden md:block relative md:w-16 md:flex-shrink-0 bg-muted/30" />
          )}

          <CardContent
            className={cn(
              "flex-1 flex flex-col",
              hasImage ? "p-4 md:py-4 md:px-5" : "p-5",
              !hasImage && "md:pl-5"
            )}
          >
            <div className="flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-semibold transition-colors duration-200 group-hover:text-primary line-clamp-1">
                  {report.title}
                </h3>

                <Badge
                  className={cn(
                    "transition-colors flex-shrink-0",
                    report.status === ReportStatus.DRAFT &&
                      "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
                    report.status === ReportStatus.APPROVED &&
                      "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
                    report.status === ReportStatus.REJECTED &&
                      "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  )}
                  variant="outline"
                >
                  {report.status}
                </Badge>
              </div>

              {report.description && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {report.description}
                </p>
              )}
            </div>

            <CardFooter className="px-0 pt-3 pb-0 mt-3 border-t">
              <div className="flex flex-1 items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Created {format(new Date(report.created_at), "MMM d, yyyy")}
                </span>
                <span>
                  Updated {format(new Date(report.updated_at), "MMM d, yyyy")}
                </span>
              </div>
            </CardFooter>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

/**
 * Report loading skeleton
 */
function ReportSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row md:h-56">
        <Skeleton className="w-full h-48 md:w-72 md:h-56 rounded-t-lg md:rounded-l-lg md:rounded-tr-none" />

        <div className="flex-1 p-4 md:p-5 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-2">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-6 w-20" />
          </div>

          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-4/5 mb-3" />

          <div className="flex flex-wrap gap-2 mb-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="mt-auto pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
