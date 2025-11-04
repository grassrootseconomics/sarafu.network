import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "~/lib/utils";
import { type SelectedItemBadgeProps } from "./types";

export function SelectedItemBadge<T>({
  item,
  renderItem,
  onRemove,
  isMultiSelect,
}: SelectedItemBadgeProps<T>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 min-w-0",
          isMultiSelect && "my-1 py-1 rounded-full bg-primary/10"
        )}
      >
        {renderItem(item)}
        {isMultiSelect && onRemove && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Remove item"
            className="ml-1 mr-4 rounded-full hover:bg-primary/20 p-0.5 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onRemove(item);
              }
            }}
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </div>
    </motion.div>
  );
}
