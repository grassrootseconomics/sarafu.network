"use client";

import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { type ReportStatusEnum } from "~/server/enums";
import { ReportStatusBadge } from "../reports/report-status-badge";

/**
 * Props for UserReportsList component
 */
interface UserReportsListProps {
  /** User's wallet address */
  address: string;
  /** Whether viewing own profile - shows create link in empty state */
  isOwnProfile?: boolean;
}

// Apple-like spring animations
const appleSpring = {
  gentle: { type: "spring" as const, stiffness: 100, damping: 20 },
  snappy: { type: "spring" as const, stiffness: 300, damping: 30 },
};

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: appleSpring.gentle,
  },
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
export function UserReportsList({ address, isOwnProfile = false }: UserReportsListProps) {
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
        className="space-y-4"
      >
        {[1, 2, 3].map((i) => (
          <ReportSkeleton key={i} index={i} />
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
        <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-base text-muted-foreground">
          Unable to load reports
        </p>
      </motion.div>
    );
  }

  if (!allReports || allReports.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={appleSpring.gentle}
        className="text-center py-16 bg-card/60 backdrop-blur-sm border border-border/20 rounded-2xl md:rounded-3xl"
      >
        <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-lg font-medium text-muted-foreground mb-1">
          {isOwnProfile ? "You don't have any reports yet" : "No reports"}
        </p>
        <p className="text-sm text-muted-foreground/60 mb-4">
          {isOwnProfile
            ? "Create your first report to get started"
            : "This user hasn't created any reports yet"}
        </p>
        {isOwnProfile && (
          <Button asChild variant="outline">
            <Link href="/reports/create">Create Report</Link>
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {allReports.map((report) => (
          <motion.div
            key={report.id}
            variants={itemVariants}
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
          className="flex justify-center items-center py-6 text-sm text-muted-foreground/60"
        >
          <Loader2 className="size-4 animate-spin mr-2" />
          Loading
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
    <motion.div
      whileHover={{ y: -4 }}
      transition={appleSpring.snappy}
    >
      <Link
        href={`/reports/${report.id}`}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
      >
        <div
          className={cn(
            "h-full overflow-hidden",
            "bg-card/60 backdrop-blur-sm",
            "border border-border/20",
            "rounded-2xl",
            "shadow-sm hover:shadow-lg hover:shadow-black/5",
            "transition-shadow duration-500"
          )}
        >
          <div className="flex flex-col md:flex-row">
            {hasImage ? (
              <div className="w-full h-52 md:w-80 md:h-auto md:flex-shrink-0 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={report.image_url!}
                    alt={`Image for ${report.title}`}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </div>
              </div>
            ) : (
              <div className="hidden md:block relative md:w-4 md:flex-shrink-0 bg-muted/20" />
            )}

            <div
              className={cn(
                "flex-1 flex flex-col p-6 md:p-8",
                !hasImage && "md:pl-6"
              )}
            >
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary line-clamp-1">
                    {report.title}
                  </h3>

                  <ReportStatusBadge
                    status={report.status as keyof typeof ReportStatusEnum}
                  />
                </div>

                {report.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-5">
                    {report.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-6 pt-5 border-t border-border/10 text-xs text-muted-foreground/50">
                <span>
                  Created {format(new Date(report.created_at), "MMM d, yyyy")}
                </span>
                <span>
                  Updated {format(new Date(report.updated_at), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * Report loading skeleton
 */
function ReportSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 0.7, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "overflow-hidden",
        "bg-card/60 backdrop-blur-sm",
        "border border-border/20",
        "rounded-2xl"
      )}
    >
      <div className="flex flex-col md:flex-row">
        <Skeleton className="w-full h-52 md:w-80 md:h-48 rounded-none" />

        <div className="flex-1 p-6 md:p-8 flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-4">
            <Skeleton className="h-6 w-2/3 rounded" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <Skeleton className="h-4 w-full mb-2 rounded" />
          <Skeleton className="h-4 w-4/5 mb-5 rounded" />

          <div className="mt-auto pt-5 border-t border-border/10">
            <div className="flex gap-6">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
