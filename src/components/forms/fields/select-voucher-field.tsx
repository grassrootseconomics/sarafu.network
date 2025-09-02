/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import * as React from "react";

import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";

import { type FieldPath, type UseFormReturn } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { type FormValues } from "./type-helper";

import { useVirtualizer } from "@tanstack/react-virtual";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import { cn } from "~/lib/utils";

export interface SelectVoucherFieldProps<T, Form extends UseFormReturn> {
  form: Form;
  name: FieldPath<FormValues<Form>>;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  label?: string;
  getFormValue: (item: T) => unknown;
  searchableValue: (item: T) => string;
  renderSelectedItem: (item: T) => React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
  items: T[];
  className?: string;
  isMultiSelect?: boolean; // New prop to toggle between single and multi-select
}

export function SelectVoucherField<T, Form extends UseFormReturn<any>>(
  props: SelectVoucherFieldProps<T, Form>
) {
  const isMultiSelect = props.isMultiSelect ?? false;

  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={cn("space-y-2 flex flex-col", props.className)}>
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <FormControl>
            <SelectVoucher
              onChange={(itemsOrItem) => {
                if (isMultiSelect) {
                  field.onChange(
                    (itemsOrItem as T[]).map((item) => props.getFormValue(item))
                  );
                } else {
                  field.onChange(
                    itemsOrItem ? props.getFormValue(itemsOrItem as T) : null
                  );
                }
              }}
              items={props.items}
              placeholder={props.placeholder}
              value={
                isMultiSelect
                  ? props.items.filter((v) =>
                      (field.value as T[])?.includes(props.getFormValue(v) as T)
                    )
                  : props.items.find(
                      (v) => (props.getFormValue(v) as T) === field.value
                    ) ?? null
              }
              disabled={props.disabled}
              renderSelectedItem={props.renderSelectedItem}
              searchableValue={props.searchableValue}
              renderItem={props.renderItem}
              key={props.name}
              isMultiSelect={isMultiSelect}
            />
          </FormControl>

          {props.description && (
            <FormDescription>{props.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export interface SelectVoucherProps<T> {
  disabled?: boolean;
  items: T[];
  onChange: (itemsOrItem: T[] | T | null) => void;
  value: T[] | T | null;
  renderItem: (item: T) => React.ReactNode;
  renderSelectedItem: (item: T) => React.ReactNode;
  searchableValue: (item: T) => string;
  placeholder?: string;
  isMultiSelect?: boolean; // New prop to toggle between single and multi-select
}

export function SelectVoucher<T>(props: SelectVoucherProps<T>) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isMultiSelect = props.isMultiSelect ?? false;

  const [selected, setSelected] = React.useState<T[] | T | null>(
    props.value || (isMultiSelect ? [] : null)
  );

  // Sync internal state with props.value when it changes
  React.useEffect(() => {
    setSelected(props.value || (isMultiSelect ? [] : null));
  }, [props.value, isMultiSelect]);

  const handleChange = (itemsOrItem: T[] | T | null) => {
    setSelected(itemsOrItem);
    props.onChange(itemsOrItem);
  };

  const selectedItems = isMultiSelect
    ? (selected as T[])
    : selected
    ? [selected as T]
    : [];

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex items-center",
              "justify-between w-full min-h-12 h-auto px-3 py-2 text-left font-normal",
              "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none",

              "border-2 border-transparent focus:border-primary/20",
              props.disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={props.disabled}
          >
            <div className="flex flex-wrap gap-1.5 flex-1 min-w-0 max-w-[calc(100%-2rem)]">
              <AnimatePresence mode="popLayout">
                {selectedItems.length > 0 ? (
                  selectedItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors max-w-full truncate"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {props.renderSelectedItem(item)}
                        </div>
                        {isMultiSelect && (
                          <button
                            type="button"
                            className="ml-1 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChange(
                                selectedItems.filter((i) => i !== item)
                              );
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    </motion.div>
                  ))
                ) : (
                  <span className="text-muted-foreground">
                    {props.placeholder || "Select..."}
                  </span>
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
        </PopoverTrigger>
        <PopoverContent
          className="min-w-[320px] max-w-[480px] w-[max(var(--radix-popover-trigger-width),320px)] p-0 shadow-lg border"
          align="start"
          sideOffset={4}
          style={{
            maxHeight: "min(400px, calc(100vh - 120px))",
            overflow: "hidden",
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
          <SelectList
            items={props.items}
            setOpen={setOpen}
            renderItem={props.renderItem}
            setSelected={handleChange}
            selectedItems={selectedItems}
            searchableValue={props.searchableValue}
            isMultiSelect={isMultiSelect}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      preventScrollRestoration={false}
      modal={false}
    >
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-between w-full min-h-10 h-auto px-3 py-2 text-left font-normal hover:bg-muted",
            props.disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={props.disabled}
        >
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            <AnimatePresence mode="popLayout">
              {selectedItems.length > 0 ? (
                selectedItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary"
                    >
                      <div className="flex items-center gap-1.5">
                        {props.renderSelectedItem(item)}
                      </div>
                      {isMultiSelect && (
                        <button
                          type="button"
                          className="ml-1 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChange(
                              selectedItems.filter((i) => i !== item)
                            );
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  </motion.div>
                ))
              ) : (
                <span className="text-muted-foreground">
                  {props.placeholder || "Select..."}
                </span>
              )}
            </AnimatePresence>
          </div>
          <ChevronDown
            className={cn(
              "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className="max-h-[85vh] flex flex-col"
        onInteractOutside={(e) => {
          // Don't close drawer when interacting with scroll container
          if (
            e.target instanceof Element &&
            e.target.closest("[data-virtualized-list]")
          ) {
            e.preventDefault();
          }
        }}
      >
        <div className="px-4 py-2 border-b flex-shrink-0">
          <h3 className="font-semibold text-lg">Select Voucher</h3>
          <p className="text-sm text-muted-foreground">
            Choose from available vouchers
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <SelectList
            items={props.items}
            renderItem={props.renderItem}
            setOpen={setOpen}
            setSelected={handleChange}
            selectedItems={selectedItems}
            searchableValue={props.searchableValue}
            isMultiSelect={isMultiSelect}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function SelectList<T>({
  setOpen,
  setSelected,
  items,
  searchableValue,
  renderItem,
  selectedItems,
  isMultiSelect,
}: {
  setOpen: (open: boolean) => void;
  setSelected: (itemsOrItem: T[] | T | null) => void;
  renderItem: (item: T) => React.ReactNode;
  searchableValue: (item: T) => string;
  items: T[];
  selectedItems: T[];
  isMultiSelect: boolean;
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus search input when component mounts
  React.useEffect(() => {
    const searchInput = searchInputRef.current;
    if (searchInput) {
      const timeoutId = setTimeout(() => {
        searchInput.focus();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, []);

  const filteredItems = React.useMemo(
    () =>
      items.filter((item) =>
        searchableValue(item).toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [items, searchQuery, searchableValue]
  );

  // Virtual scrolling for performance
  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 60,
    overscan: 8,
    measureElement: (element) => element?.getBoundingClientRect().height ?? 60,
  });

  const handleItemClick = React.useCallback(
    (item: T) => {
      const isSelected = selectedItems.includes(item);

      if (isMultiSelect) {
        const newSelectedItems = isSelected
          ? selectedItems.filter((i) => i !== item)
          : [...selectedItems, item];
        setSelected(newSelectedItems);
      } else {
        setSelected(item);
        setOpen(false);
      }
    },
    [selectedItems, isMultiSelect, setSelected, setOpen]
  );

  return (
    <div className="flex flex-col h-full max-h-[min(400px,calc(100vh-120px))]">
      {/* Search Header */}
      <div className="flex items-center px-3 py-3 border-b border-border/40 bg-muted/30 flex-shrink-0">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search vouchers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-0 px-0 py-2 text-sm focus:ring-0 bg-transparent flex-1 outline-none placeholder:text-muted-foreground"
          autoComplete="off"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="ml-2 p-1 hover:bg-muted rounded-sm transition-colors"
            type="button"
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
        onWheel={(e) => {
          // Ensure wheel events are properly handled
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          // Ensure touch events are properly handled
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          // Ensure touch move events are properly handled
          e.stopPropagation();
        }}
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

              const isSelected = selectedItems.includes(item);

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
        <div className="px-3 py-2 border-t border-border/40 text-xs text-muted-foreground bg-muted/30 flex-shrink-0">
          {filteredItems.length} voucher{filteredItems.length !== 1 ? "s" : ""}
          {searchQuery && ` matching "${searchQuery}"`}
          {items.length !== filteredItems.length && ` of ${items.length} total`}
        </div>
      )}
    </div>
  );
}
