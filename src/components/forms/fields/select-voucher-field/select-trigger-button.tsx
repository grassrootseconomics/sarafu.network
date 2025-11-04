import { AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { SelectedItemBadge } from "./selected-item-badge";
import { type SelectTriggerButtonProps } from "./types";

/* eslint-disable jsx-a11y/role-has-required-aria-props */
export function SelectTriggerButton<T>({
  open,
  disabled,
  selectedItems,
  placeholder = "Select...",
  isMultiSelect,
  renderSelectedItem,
  onRemoveItem,
  className,
  ...props
}: SelectTriggerButtonProps<T>) {
  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      className={cn(
        "flex rounded-full w-full min-h-[42px] min-w-[120px] items-center bg-primary/10 text-primary hover:bg-primary/20 transition-colors max-w-full truncate px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        disabled && "opacity-50 cursor-not-allowed",
        isMultiSelect && "rounded-sm",
        className
      )}
      disabled={disabled}
      {...props}
    >
      <div className="flex flex-wrap gap-1.5 flex-1 min-w-0 max-w-[calc(100%-2rem)]">
        <AnimatePresence mode="popLayout">
          {selectedItems.length > 0 ? (
            selectedItems.map((item, idx) => (
              <SelectedItemBadge
                key={idx}
                item={item}
                renderItem={renderSelectedItem}
                onRemove={isMultiSelect ? onRemoveItem : undefined}
                isMultiSelect={isMultiSelect}
              />
            ))
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </AnimatePresence>
      </div>
      <ChevronDown
        className={cn(
          "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
          open && "rotate-180"
        )}
      />
    </button>
  );
}
