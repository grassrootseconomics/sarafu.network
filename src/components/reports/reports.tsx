"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo } from "react";
import { Authorization } from "~/hooks/useAuth";
import { ReportStatus } from "~/server/enums";
import { buttonVariants } from "../ui/button";
import { ReportFilters } from "./report-fIlters";
import { ReportList } from "./report-list";

interface FilterState {
  tags: string[];
  creatorAddress?: string;
  status?: keyof typeof ReportStatus;
}

// Component that uses useSearchParams
function ReportsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filters from URL query params
  const filters = useMemo<FilterState>(() => {
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    const creatorAddress = searchParams.get("creator_address") || undefined;
    const status = searchParams.get("status") as
      | keyof typeof ReportStatus
      | undefined;

    return {
      tags,
      creatorAddress,
      status: status && status in ReportStatus ? status : undefined,
    };
  }, [searchParams]);

  // Update URL when filters change
  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update tags
      if (newFilters.tags.length > 0) {
        params.set("tags", newFilters.tags.join(","));
      } else {
        params.delete("tags");
      }

      // Update creator address
      if (newFilters.creatorAddress) {
        params.set("creator_address", newFilters.creatorAddress);
      } else {
        params.delete("creator_address");
      }

      // Update status
      if (newFilters.status) {
        params.set("status", newFilters.status);
      } else {
        params.delete("status");
      }

      // Update URL with new params
      window.history.replaceState({}, "", `${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div>
      <div className="flex justify-between items-center my-4 gap-2">
        <ReportFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          className="flex-1"
        />
        <Authorization resource="Reports" action="CREATE">
          <Link href="/reports/create" className={buttonVariants()}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Report
          </Link>
        </Authorization>
      </div>
      <ReportList
        query={{
          tags: filters.tags,
          creatorAddress: filters.creatorAddress,
          status: filters.status,
          limit: 10,
        }}
      />
    </div>
  );
}

// Fallback component for Suspense
function ReportsFallback() {
  return (
    <div>
      <div className="flex justify-between items-center my-4 gap-2">
        <div className="h-10 w-full bg-gray-100 animate-pulse rounded-md flex-1" />
        <div className="h-10 w-32 bg-gray-100 animate-pulse rounded-md" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-md" />
        ))}
      </div>
    </div>
  );
}

export function Reports() {
  return (
    <Suspense fallback={<ReportsFallback />}>
      <ReportsContent />
    </Suspense>
  );
}
