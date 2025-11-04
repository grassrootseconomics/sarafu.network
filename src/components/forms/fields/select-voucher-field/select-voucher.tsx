"use client";

import { useCallback, useMemo, useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import { cn } from "~/lib/utils";
import { SelectList } from "./select-list";
import { SelectTriggerButton } from "./select-trigger-button";
import { CONSTANTS, type SelectVoucherProps } from "./types";

export function SelectVoucher<T>(props: SelectVoucherProps<T>) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isMultiSelect = props.isMultiSelect ?? false;

  const selectedItems = useMemo(() => {
    if (isMultiSelect) {
      return props.value as T[];
    }
    return props.value ? [props.value as T] : [];
  }, [props.value, isMultiSelect]);

  const handleSelect = useCallback(
    (item: T) => {
      if (isMultiSelect) {
        const currentValues = props.value as T[];
        const isSelected = currentValues.includes(item);

        const newValues = isSelected
          ? currentValues.filter((i) => i !== item)
          : [...currentValues, item];

        (props.onChange as (items: T[]) => void)(newValues);
      } else {
        (props.onChange as (item: T | null) => void)(item);
      }
    },
    [props, isMultiSelect]
  );

  const handleRemoveItem = useCallback(
    (item: T) => {
      if (isMultiSelect) {
        const currentValues = props.value as T[];
        const newValues = currentValues.filter((i) => i !== item);
        (props.onChange as (items: T[]) => void)(newValues);
      }
    },
    [props, isMultiSelect]
  );

  const triggerButton = (
    <SelectTriggerButton
      open={open}
      disabled={props.disabled}
      selectedItems={selectedItems}
      placeholder={props.placeholder}
      isMultiSelect={isMultiSelect}
      renderSelectedItem={props.renderSelectedItem}
      onRemoveItem={handleRemoveItem}
    />
  );

  const selectList = (
    <SelectList
      items={props.items}
      selectedItems={selectedItems}
      isMultiSelect={isMultiSelect}
      searchableValue={props.searchableValue}
      renderItem={props.renderItem}
      onSelect={handleSelect}
      onClose={() => setOpen(false)}
    />
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
        <PopoverContent
          className={cn(
            "p-0 shadow-lg border",
            `min-w-[${CONSTANTS.POPOVER_MIN_WIDTH}px]`,
            `max-w-[${CONSTANTS.POPOVER_MAX_WIDTH}px]`,
            "w-[max(var(--radix-popover-trigger-width),320px)]"
          )}
          align="start"
          sideOffset={4}
          style={{
            maxHeight: `min(${CONSTANTS.MAX_LIST_HEIGHT}px, calc(100vh - ${CONSTANTS.LIST_OFFSET}px))`,
            overflow: "hidden",
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
          {selectList}
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
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent
        className="max-h-[85vh] flex flex-col"
        onInteractOutside={(e) => {
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
        <div className="flex-1 min-h-0">{selectList}</div>
      </DrawerContent>
    </Drawer>
  );
}
