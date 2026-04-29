import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useState } from "react";
import { trpc } from "~/lib/trpc";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { PoolListItem } from "./pool-list-item";

interface PoolListProps {
  searchTerm: string;
  searchTags: string[];
}

type SortBy = "swaps" | "name" | "vouchers";
type SortDirection = "asc" | "desc";

function PoolSkeleton() {
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

function PoolSortButton({
  type,
  label,
  sortBy,
  sortDirection,
  onToggle,
}: {
  type: SortBy;
  label: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
  onToggle: (sortBy: SortBy) => void;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => onToggle(type)}
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
}

export function PoolList({ searchTerm, searchTags }: PoolListProps) {
  const [sortBy, setSortBy] = useState<SortBy>("swaps");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <PoolSkeleton key={idx} />
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Sort by:
        </span>
        <div className="flex flex-wrap gap-1">
          <PoolSortButton
            type="swaps"
            label="Swaps"
            sortBy={sortBy}
            sortDirection={sortDirection}
            onToggle={toggleSort}
          />
          <PoolSortButton
            type="vouchers"
            label="Vouchers"
            sortBy={sortBy}
            sortDirection={sortDirection}
            onToggle={toggleSort}
          />
          <PoolSortButton
            type="name"
            label="Name"
            sortBy={sortBy}
            sortDirection={sortDirection}
            onToggle={toggleSort}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredPools.map((pool, index) => (
          <PoolListItem
            key={pool.contract_address}
            pool={pool}
            priority={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
