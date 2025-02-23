"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { trpc } from "~/lib/trpc";
import { type RouterInput } from "~/server/api/root";
import { ReportListItem, ReportListItemSkeleton } from "./report-list-item";

interface ReportListProps {
  query: Omit<RouterInput["report"]["list"], "cursor">;
}

export function ReportList({ query }: ReportListProps) {
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

  if (!data || data.pages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">No reports found.</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {data?.pages.map((page) =>
        page.items.map((report) => (
          <ReportListItem key={report.id} report={report} />
        ))
      )}
      {(isFetchingNextPage || isLoading) && <ReportListItemSkeleton />}

      <div ref={ref} className="h-8 w-full"></div>
    </div>
  );
}
