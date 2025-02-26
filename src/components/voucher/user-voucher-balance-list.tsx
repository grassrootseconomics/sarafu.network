import { motion } from "framer-motion";
import { Search, SortAsc, SortDesc } from "lucide-react";
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
import { useAuth } from "~/hooks/useAuth";
import { cn } from "~/lib/utils";
import { type RouterOutput } from "~/server/api/root";
import { useMultiVoucherBalances } from "./hooks";
import { UserVoucherBalanceItem } from "./user-voucher-balance-item";

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

type SortOption = "name" | "balance" | "symbol";
type SortDirection = "asc" | "desc";

interface UserVoucherBalanceListProps {
  vouchers: RouterOutput["me"]["vouchers"];
  className?: string;
}

export function UserVoucherBalanceList({
  vouchers,
  className,
}: UserVoucherBalanceListProps) {
  const auth = useAuth();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const balances = useMultiVoucherBalances(
    vouchers?.map((v) => v.voucher_address as `0x${string}`) ?? [],
    auth?.session?.address
  );

  const filteredAndSortedVouchers = useMemo(() => {
    if (!vouchers) return [];

    const filtered = vouchers.filter((voucher) => {
      const searchLower = search.toLowerCase();
      return (
        voucher.voucher_name?.toLowerCase().includes(searchLower) ||
        voucher.symbol?.toLowerCase().includes(searchLower)
      );
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
  }, [vouchers, search, sortBy, sortDirection, balances]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search vouchers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-[120px]">
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
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
          >
            {sortDirection === "asc" ? (
              <SortAsc className="size-4" />
            ) : (
              <SortDesc className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className={cn("space-y-3", className)}
      >
        {filteredAndSortedVouchers.map((voucher) => (
          <motion.div
            key={voucher.voucher_address}
            variants={itemVariants}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            <UserVoucherBalanceItem
              voucher={voucher}
              balance={balances[voucher.voucher_address as `0x${string}`]}
            />
          </motion.div>
        ))}

        {filteredAndSortedVouchers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg"
          >
            {search
              ? "No vouchers found matching your search."
              : "No vouchers available."}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
