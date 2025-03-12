"use client";

import { ClipboardListIcon } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { type RouterInput } from "~/server/api/root";
import { ReportListItem, ReportListItemSkeleton } from "./report-list-item";

interface ReportListProps {
  query: Omit<RouterInput["report"]["list"], "cursor">;
  className?: string;
}

export function ReportList({ query, className }: ReportListProps) {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    trpc.report.list.useInfiniteQuery(query, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: undefined,
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Initial loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <ReportListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!data || data.pages.length === 0 || data.pages[0].items.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12 px-4 text-center",
          className
        )}
      >
        <ClipboardListIcon className="h-12 w-12 text-muted-foreground/60 mb-4" />
        <h3 className="text-lg font-medium">No reports found</h3>
        <p className="text-muted-foreground mt-1 max-w-md">
          There are no reports matching your criteria. Try adjusting your
          filters or create a new report.
        </p>
      </div>
    );
  }

  // Calculate total reports for accessibility
  const totalReports = data.pages.reduce(
    (count, page) => count + page.items.length,
    0
  );

  return (
    <div
      className={cn("space-y-4", className)}
      aria-label={`Report list containing ${totalReports} reports`}
    >
      <div className="grid grid-cols-1 gap-4">
        {data.pages.map((page, pageIndex) =>
          page.items.map((report, reportIndex) => (
            <ReportListItem
              key={report.id}
              report={report}
              priority={pageIndex === 0 && reportIndex < 2}
            />
          ))
        )}
      </div>

      {isFetchingNextPage && (
        <div className="pt-2">
          <ReportListItemSkeleton />
        </div>
      )}

      <div ref={ref} className="h-8 w-full" aria-hidden="true"></div>
    </div>
  );
}
