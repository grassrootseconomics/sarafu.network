import { ArrowDownAZ, ArrowUpAZ, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
  const [filter, setFilter] = useState<FilterOption>("active");

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
    <div className="space-y-4">
      {/* Single Row: Search + Filter/Sort Popover */}
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 z-10 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Search vouchers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
            aria-label="Search vouchers"
          />
        </div>

        {/* Filter/Sort Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10 gap-2 shrink-0">
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">Filters</span>
              {(filter !== "active" || sortBy !== "balance") && (
                <span className="size-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56">
            <div className="space-y-4">
              {/* Filter Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Show</label>
                <div className="flex flex-col gap-1">
                  <Button
                    variant={filter === "active" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("active")}
                    className="justify-start"
                  >
                    Active Balance
                  </Button>
                  <Button
                    variant={filter === "zero" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("zero")}
                    className="justify-start"
                  >
                    Zero Balance
                  </Button>
                  <Button
                    variant={filter === "all" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("all")}
                    className="justify-start"
                  >
                    All Vouchers
                  </Button>
                </div>
              </div>

              {/* Sort Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort by</label>
                <div className="flex gap-2">
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as SortOption)}
                  >
                    <SelectTrigger className="flex-1 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balance">Balance</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="symbol">Symbol</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() =>
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                    }
                    aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
                  >
                    {sortDirection === "asc" ? (
                      <ArrowUpAZ className="size-4" />
                    ) : (
                      <ArrowDownAZ className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Result Count */}
      <p className="text-sm text-muted-foreground">
        {filteredAndSortedVouchers.length} of {vouchers?.length ?? 0} vouchers
      </p>

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
