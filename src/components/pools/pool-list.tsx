import {
  ArrowDownIcon,
  ArrowUpIcon,
  Info,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "~/lib/trpc";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { PoolListItem } from "./pool-list-item";

interface PoolListProps {
  searchTerm: string;
  searchTags: string[];
}

type SortBy = "swaps" | "name" | "vouchers";
type SortDirection = "asc" | "desc";
type ViewMode = "grid" | "list";

function PoolSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "list") {
    return (
      <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 py-4 px-4 xs:px-6">
        {/* Image and Primary Info Section */}
        <div className="flex gap-3 items-start xs:items-center">
          <div className="relative h-10 w-10 xs:h-12 xs:w-12 flex-shrink-0 rounded-lg overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-48 xs:hidden mt-1" />
            </div>
          </div>
        </div>

        {/* Secondary Info Section */}
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 flex-1 items-start">
          <div className="hidden md:block flex-1 min-w-0">
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* Mobile Tags and Stats */}
          <div className="flex xs:hidden gap-3 items-center justify-between w-full border-t pt-2">
            <div className="flex gap-1 flex-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-8" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Desktop Tags */}
          <div className="hidden xs:flex gap-1 w-32">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>

          {/* Desktop Stats */}
          <div className="hidden xs:block w-32">
            <div className="space-y-1 flex flex-col items-end">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden h-[420px] flex flex-col">
      <div className="relative h-48 w-full flex-shrink-0">
        <Skeleton className="h-full w-full" />
      </div>
      <CardHeader className="flex-shrink-0">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

function TableHeader({
  sortBy,
  sortDirection,
  onSort,
}: {
  sortBy: SortBy;
  sortDirection: SortDirection;
  onSort: (field: SortBy) => void;
}) {
  function HeaderCell({
    label,
    field,
    tooltip,
    className = "",
  }: {
    label: string;
    field: SortBy | null;
    tooltip: string;
    className?: string;
  }) {
    const isSorted = field !== null && sortBy === field;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 font-medium hover:bg-muted/80 ${
                isSorted ? "bg-muted" : ""
              } ${className}`}
              onClick={() => field && onSort(field)}
              disabled={!field}
            >
              <span className="flex items-center gap-1">
                <span className="text-xs xs:text-sm">{label}</span>
                <Info className="h-3 w-3 text-muted-foreground" />
                {isSorted && (
                  <span className="text-xs text-muted-foreground">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 py-2 px-4 xs:px-6 bg-muted/50 rounded-t-lg border-b">
      {/* Mobile Header */}
      <div className="flex xs:hidden items-center justify-between w-full">
        <HeaderCell
          label="Name"
          field="name"
          tooltip="Sort pools by name"
          className="justify-start"
        />
        <HeaderCell
          label="Activity"
          field="swaps"
          tooltip="Sort pools by swap activity"
          className="justify-end"
        />
      </div>

      {/* Desktop Header */}
      <div className="hidden xs:flex items-center gap-4 w-full">
        <div className="w-10 xs:w-12" />
        <HeaderCell
          label="Name"
          field="name"
          tooltip="Sort pools by name"
          className="flex-1 justify-start"
        />
        <HeaderCell
          label="Description"
          field={null}
          tooltip="Description field (not sortable)"
          className="hidden md:flex flex-1 justify-start"
        />
        <HeaderCell
          label="Tags"
          field={null}
          tooltip="Tags field (not sortable)"
          className="hidden sm:flex w-32 justify-start"
        />
        <HeaderCell
          label="Activity"
          field="swaps"
          tooltip="Sort pools by swap activity"
          className="w-32 justify-end"
        />
      </div>
    </div>
  );
}

export function PoolList({ searchTerm, searchTags }: PoolListProps) {
  const [sortBy, setSortBy] = useState<SortBy>("swaps");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { data: pools, isLoading } = trpc.pool.list.useQuery({
    sortBy,
    sortDirection,
  });

  const toggleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(newSortBy);
      setSortDirection("desc");
    }
  };

  if (isLoading) {
    return (
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            : "border rounded-lg divide-y"
        }
      >
        {viewMode === "list" && (
          <TableHeader
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={toggleSort}
          />
        )}
        {Array.from({ length: 6 }).map((_, idx) => (
          <PoolSkeleton key={idx} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  if (!pools || pools.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">
          No pools available at the moment.
        </p>
      </div>
    );
  }

  // Filter pools based on search term and tags
  const filteredPools = pools.filter((pool) => {
    const matchesSearch =
      searchTerm === "" ||
      pool.pool_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.pool_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags =
      searchTags.length === 0 ||
      searchTags.every((tag) => pool.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const SortButton = ({ type, label }: { type: SortBy; label: string }) => (
    <Button
      variant="ghost"
      onClick={() => toggleSort(type)}
      className="flex items-center gap-2"
    >
      {label}
      {sortBy === type &&
        (sortDirection === "asc" ? (
          <ArrowUpIcon className="h-4 w-4" />
        ) : (
          <ArrowDownIcon className="h-4 w-4" />
        ))}
    </Button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Sort by:
          </span>
          <div className="flex flex-wrap gap-1">
            <SortButton type="swaps" label="Swaps" />
            <SortButton type="vouchers" label="Vouchers" />
            <SortButton type="name" label="Name" />
          </div>
        </div>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value: ViewMode) => value && setViewMode(value)}
          className="self-end sm:self-auto"
        >
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <LayoutList className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            : "border rounded-lg divide-y"
        }
      >
        {viewMode === "list" && (
          <TableHeader
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={toggleSort}
          />
        )}
        {filteredPools.map((pool) => (
          <PoolListItem
            key={pool.contract_address}
            pool={pool}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}
