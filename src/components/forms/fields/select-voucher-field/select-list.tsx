import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, Search, X } from "lucide-react";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { useDebouncedValue } from "./hooks/use-debounced-value";
import { CONSTANTS, type SelectListProps } from "./types";

function SelectListComponent<T>({
  items,
  selectedItems,
  isMultiSelect,
  searchableValue,
  renderItem,
  onSelect,
  onClose,
}: SelectListProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(
    searchQuery,
    CONSTANTS.SEARCH_DEBOUNCE_MS
  );
  const listRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        searchableValue(item)
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase())
      ),
    [items, debouncedSearchQuery, searchableValue]
  );

  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: useCallback(() => listRef.current, []),
    estimateSize: useCallback(() => CONSTANTS.VIRTUAL_ITEM_ESTIMATE_HEIGHT, []),
    overscan: CONSTANTS.VIRTUAL_OVERSCAN_COUNT,
    measureElement: (element) =>
      element?.getBoundingClientRect().height ??
      CONSTANTS.VIRTUAL_ITEM_ESTIMATE_HEIGHT,
  });

  const handleItemClick = useCallback(
    (item: T) => {
      onSelect(item);
      if (!isMultiSelect) {
        onClose();
      }
    },
    [onSelect, isMultiSelect, onClose]
  );

  const isItemSelected = useCallback(
    (item: T) => selectedItems.includes(item),
    [selectedItems]
  );

  return (
    <div className="flex flex-col h-full max-h-[min(400px,calc(100vh-120px))]">
      {/* Search Header */}
      <div className="flex items-center px-3 py-3 border-b border-border/40 bg-muted/30 flex-shrink-0">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          type="text"
          placeholder="Search vouchers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-0 px-0 py-2 text-sm focus:ring-0 bg-transparent flex-1 outline-none placeholder:text-muted-foreground"
          autoComplete="off"
          autoFocus
          aria-label="Search vouchers"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="ml-2 p-1 hover:bg-muted rounded-sm transition-colors"
            type="button"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Virtual Scrollable List */}
      <div
        ref={listRef}
        data-virtualized-list
        className="flex-1 overflow-auto"
        style={{
          overscrollBehavior: "contain",
          touchAction: "pan-y",
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
        }}
        onWheel={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {searchQuery ? (
              <div>
                <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No vouchers found for &quot;{searchQuery}&quot;</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              <div>
                <div className="h-8 w-8 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
                  <Search className="h-4 w-4 opacity-50" />
                </div>
                <p>No vouchers available</p>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = filteredItems[virtualItem.index];
              if (!item) return null;

              const isSelected = isItemSelected(item);

              return (
                <div
                  key={virtualItem.index}
                  className={cn(
                    "absolute top-0 left-0 w-full flex cursor-pointer select-none items-center px-3 py-3 text-sm",
                    "focus:bg-primary/10 focus:outline-none hover:bg-primary/10",
                    "active:bg-primary/10",
                    isSelected &&
                      "bg-primary/10 text-primary font-medium hover:bg-muted"
                  )}
                  style={{
                    transform: `translateY(${virtualItem.start}px)`,
                    height: `${virtualItem.size}px`,
                  }}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center flex-1 min-w-0 pr-2">
                      {renderItem(item)}
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with item count */}
      {filteredItems.length > 0 && (
        <div
          className="px-3 py-2 border-t border-border/40 text-xs text-muted-foreground bg-muted/30 flex-shrink-0"
          role="status"
          aria-live="polite"
        >
          {filteredItems.length} voucher{filteredItems.length !== 1 ? "s" : ""}
          {searchQuery && ` matching "${searchQuery}"`}
          {items.length !== filteredItems.length && ` of ${items.length} total`}
        </div>
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const SelectList = memo(
  SelectListComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.items === nextProps.items &&
      prevProps.selectedItems === nextProps.selectedItems &&
      prevProps.isMultiSelect === nextProps.isMultiSelect &&
      prevProps.searchableValue === nextProps.searchableValue &&
      prevProps.renderItem === nextProps.renderItem &&
      prevProps.onSelect === nextProps.onSelect &&
      prevProps.onClose === nextProps.onClose
    );
  }
) as typeof SelectListComponent;
