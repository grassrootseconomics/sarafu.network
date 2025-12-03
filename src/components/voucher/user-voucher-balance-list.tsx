import { Circle, CircleCheck, Search, SortAsc, SortDesc } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { TooltipHelp } from "~/components/ui/tooltip-help";
import { useAuth } from "~/hooks/useAuth";
import { cn } from "~/lib/utils";
import { type RouterOutput } from "~/server/api/root";
import { useMultiVoucherBalances } from "./hooks";
import { UserVoucherBalanceItem } from "./user-voucher-balance-item";

type SortOption = "name" | "balance" | "symbol";
type SortDirection = "asc" | "desc";
type FilterOption = "all" | "active" | "zero";

interface UserVoucherBalanceListProps {
  vouchers: RouterOutput["me"]["vouchers"];
  className?: string;
  /** Optional address to fetch balances for (defaults to logged-in user) */
  address?: `0x${string}`;
}

export function UserVoucherBalanceList({
  vouchers,
  className,
  address,
}: UserVoucherBalanceListProps) {
  const auth = useAuth();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("balance");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filter, setFilter] = useState<FilterOption>("all");

  // Use provided address or fall back to logged-in user's address
  const targetAddress = address ?? auth?.session?.address;

  const balances = useMultiVoucherBalances(
    vouchers?.map((v) => v.voucher_address as `0x${string}`) ?? [],
    targetAddress
  );

  const filteredAndSortedVouchers = useMemo(() => {
    if (!vouchers) return [];

    const filtered = vouchers.filter((voucher) => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch =
        voucher.voucher_name?.toLowerCase().includes(searchLower) ||
        voucher.symbol?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Balance filter
      const balance =
        balances[voucher.voucher_address as `0x${string}`]?.formattedNumber ||
        0;

      switch (filter) {
        case "active":
          return balance >= 0.01;
        case "zero":
          return balance < 0.01;
        case "all":
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => {
      const multiplier = sortDirection === "asc" ? 1 : -1;

      switch (sortBy) {
        case "name":
          return (
            multiplier *
            (a.voucher_name || "").localeCompare(b.voucher_name || "")
          );
        case "symbol":
          return multiplier * (a.symbol || "").localeCompare(b.symbol || "");
        case "balance":
          const balanceA =
            balances[a.voucher_address as `0x${string}`]?.value || BigInt(0);
          const balanceB =
            balances[b.voucher_address as `0x${string}`]?.value || BigInt(0);
          return (
            multiplier *
            (balanceA > balanceB ? 1 : balanceA < balanceB ? -1 : 0)
          );
        default:
          return 0;
      }
    });
  }, [vouchers, search, sortBy, sortDirection, balances, filter]);

  return (
    <div className="space-y-5">
      {/* Search and Controls Row */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <label htmlFor="voucher-search" className="sr-only">
            Search vouchers
          </label>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 z-10 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="voucher-search"
            placeholder="Search vouchers by name or symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11"
            aria-label="Search vouchers by name or symbol"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger
              className="w-[130px] h-11"
              aria-label="Sort vouchers by"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="symbol">Symbol</SelectItem>
              <SelectItem value="balance">Balance</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
            aria-label={`Sort ${
              sortDirection === "asc" ? "descending" : "ascending"
            }`}
            aria-pressed={sortDirection === "desc"}
            title={`Currently sorting ${
              sortDirection === "asc" ? "A-Z" : "Z-A"
            }. Click to reverse.`}
          >
            {sortDirection === "asc" ? (
              <SortAsc className="size-4" aria-hidden="true" />
            ) : (
              <SortDesc className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Filter Chips with Tooltips */}
      <div
        className="flex gap-2 flex-wrap items-center"
        role="group"
        aria-label="Filter vouchers"
      >
        <span className="text-sm text-muted-foreground mr-1">Filter:</span>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Show all vouchers"
            aria-pressed={filter === "all"}
          >
            All Vouchers
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant={filter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("active")}
              className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Show vouchers with active balance"
              aria-pressed={filter === "active"}
            >
              <CircleCheck
                className="w-3.5 h-3.5 mr-1.5 text-green-600"
                aria-hidden="true"
              />
              <span>Active Balance</span>
            </Button>
            <TooltipHelp content="Show only vouchers with non-zero balance" />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={filter === "zero" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("zero")}
              className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Show vouchers with zero balance"
              aria-pressed={filter === "zero"}
            >
              <Circle
                className="w-3.5 h-3.5 mr-1.5 text-gray-500"
                aria-hidden="true"
              />
              <span>Zero Balance</span>
            </Button>
            <TooltipHelp content="Show only vouchers with no current balance" />
          </div>
        </div>
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing{" "}
          <span className="font-medium text-foreground">
            {filteredAndSortedVouchers.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {vouchers?.length ?? 0}
          </span>{" "}
          vouchers
        </p>
      </div>

      {/* Vouchers List */}
      <div className={cn("space-y-3", className)}>
        {filteredAndSortedVouchers.map((voucher) => (
          <div key={voucher.voucher_address}>
            <UserVoucherBalanceItem
              voucher={voucher}
              balance={balances[voucher.voucher_address as `0x${string}`]}
            />
          </div>
        ))}

        {filteredAndSortedVouchers.length === 0 && (
          <div
            className={cn(
              "text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border-2 border-dashed"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <Search className="size-10 opacity-20" />
              <p className="font-medium">
                {search || filter !== "all"
                  ? "No vouchers found matching your criteria."
                  : "No vouchers available."}
              </p>
              {(search || filter !== "all") && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  className="text-primary"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
