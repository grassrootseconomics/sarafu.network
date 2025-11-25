import { ChevronDown, FilterIcon, UserIcon, XIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
import { trpc } from "~/lib/trpc";
import { ReportStatusEnum } from "~/server/enums";
import { ReportStatus } from "./report-status-badge";

interface FilterState {
  tags: string[];
  creatorAddress?: string;
  status?: keyof typeof ReportStatusEnum;
}

interface ReportFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

// Convert enum to array of key-value pairs for the select component
const statusOptions = Object.entries(ReportStatusEnum).map(([key, value]) => ({
  value: key,
  label: value,
}));

export function ReportFilters({
  filters,
  onFiltersChange,
  className = "",
}: ReportFiltersProps) {
  const { data: tags } = trpc.tags.list.useQuery();
  const auth = useAuth();
  const userAddress = auth?.session?.address;

  function toggleTag(tag: string) {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  }

  function handleCreatorAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim();
    onFiltersChange({ ...filters, creatorAddress: value || undefined });
  }

  function handleStatusChange(value: string) {
    onFiltersChange({
      ...filters,
      status:
        value === "all" ? undefined : (value as keyof typeof ReportStatusEnum),
    });
  }

  function toggleMyReports() {
    if (!userAddress) return;

    // If already filtering by current user, clear the filter
    if (filters.creatorAddress === userAddress) {
      onFiltersChange({ ...filters, creatorAddress: undefined });
    } else {
      // Otherwise, set filter to current user's address
      onFiltersChange({ ...filters, creatorAddress: userAddress });
    }
  }

  function clearFilters() {
    onFiltersChange({ tags: [], creatorAddress: undefined, status: undefined });
  }

  const hasActiveFilters =
    filters.tags.length > 0 || filters.creatorAddress || filters.status;

  const isShowingMyReports =
    userAddress && filters.creatorAddress === userAddress;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-wrap gap-2 items-center">
        {userAddress && (
          <Button
            variant={isShowingMyReports ? "default" : "outline"}
            className="w-full sm:w-auto"
            onClick={toggleMyReports}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            My Reports
          </Button>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Filter by Tags
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Tags</h4>
                <p className="text-sm text-muted-foreground">
                  Select tags to filter Reports
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag) => (
                  <Badge
                    key={tag.id}
                    onClick={() => toggleTag(tag.tag)}
                    variant={
                      filters.tags.includes(tag.tag) ? "default" : "outline"
                    }
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {tag.tag}
                  </Badge>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Filter by Creator
              <UserIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Creator Address</h4>
                <p className="text-sm text-muted-foreground">
                  Enter an address to filter by creator
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="creator-address">Wallet Address</Label>
                <Input
                  id="creator-address"
                  placeholder="0x..."
                  value={filters.creatorAddress || ""}
                  onChange={handleCreatorAddressChange}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Filter by Status
              <FilterIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Report Status</h4>
                <p className="text-sm text-muted-foreground">
                  Select a status to filter reports
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-select">Status</Label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <ReportStatus status={option.label} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto"
          >
            <XIcon className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer group"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              <XIcon className="h-3 w-3 ml-1 opacity-60 group-hover:opacity-100" />
            </Badge>
          ))}

          {filters.creatorAddress && (
            <Badge
              variant="secondary"
              className="cursor-pointer group"
              onClick={() =>
                onFiltersChange({ ...filters, creatorAddress: undefined })
              }
            >
              {isShowingMyReports
                ? "My Reports"
                : `${filters.creatorAddress.slice(
                    0,
                    6
                  )}...${filters.creatorAddress.slice(-4)}`}
              <XIcon className="h-3 w-3 ml-1 opacity-60 group-hover:opacity-100" />
            </Badge>
          )}

          {filters.status && (
            <Badge
              variant="secondary"
              className="cursor-pointer group"
              onClick={() => onFiltersChange({ ...filters, status: undefined })}
            >
              <ReportStatus status={filters.status} />
              <XIcon className="h-3 w-3 ml-1 opacity-60 group-hover:opacity-100" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
