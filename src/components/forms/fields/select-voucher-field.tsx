/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import * as React from "react";

import { CommandList } from "~/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";

import { type FieldPath, type UseFormReturn } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { type FormValues } from "./type-helper";

import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useVirtualizer } from "@tanstack/react-virtual";
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
        <FormItem className={cn("space-y-1 flex flex-col", props.className)}>
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

function SelectVoucher<T>(props: SelectVoucherProps<T>) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isMultiSelect = props.isMultiSelect ?? false;

  const [selected, setSelected] = React.useState<T[] | T | null>(
    props.value || (isMultiSelect ? [] : null)
  );

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
          <Button
            variant="outline"
            className="justify-start flex flex-wrap gap-2 h-[unset]"
            disabled={props.disabled}
          >
            {selectedItems.length > 0 ? (
              selectedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 py-1 px-2 outline outline-1 outline-gray-200 rounded-xl "
                >
                  {props.renderSelectedItem(item)}
                  {isMultiSelect && (
                    <RemoveButton
                      onClick={() =>
                        handleChange(selectedItems.filter((i) => i !== item))
                      }
                    />
                  )}
                </div>
              ))
            ) : (
              <>{props.placeholder}</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="center">
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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="justify-start flex flex-wrap gap-2 h-[unset]"
          disabled={props.disabled}
        >
          {selectedItems.length > 0 ? (
            selectedItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 py-1 px-2 outline outline-1 outline-gray-200 rounded-xl "
              >
                {props.renderSelectedItem(item)}
                {isMultiSelect && (
                  <RemoveButton
                    onClick={() =>
                      handleChange(selectedItems.filter((i) => i !== item))
                    }
                  />
                )}
              </div>
            ))
          ) : (
            <>{props.placeholder}</>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <ScrollArea className="mt-4 border-t">
          <SelectList
            items={props.items}
            renderItem={props.renderItem}
            setOpen={setOpen}
            setSelected={handleChange}
            selectedItems={selectedItems}
            searchableValue={props.searchableValue}
            isMultiSelect={isMultiSelect}
          />
        </ScrollArea>
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
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredItems = React.useMemo(
    () =>
      items.filter((item) =>
        searchableValue(item).toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [items, searchQuery, searchableValue]
  );

  const rowVirtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Adjust based on item height
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <Command>
      <CommandInput
        placeholder="Search..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList
        ref={parentRef}
        style={{ position: "relative", height: "300px", overflow: "auto" }}
      >
        {filteredItems.length === 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        <CommandGroup
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {virtualItems.map((virtualRow) => {
            const index = virtualRow.index;
            const item = filteredItems[index] as T;
            const isSelected = selectedItems.includes(item);

            return (
              <CommandItem
                key={`select-item-${index}`}
                value={searchableValue(item)}
                className={cn("cursor-pointer", { "bg-gray-100": isSelected })}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onSelect={() => {
                  if (isMultiSelect) {
                    const newSelectedItems = isSelected
                      ? selectedItems.filter((i) => i !== item)
                      : [...selectedItems, item];
                    setSelected(newSelectedItems);
                  } else {
                    setSelected(item);
                    setOpen(false);
                  }
                }}
              >
                {renderItem(item)}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function RemoveButton({ onClick }: { onClick: React.MouseEventHandler }) {
  return (
    <span
      role="button"
      tabIndex={0}
      className="cursor-pointer p-0"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(e as unknown as React.MouseEvent<HTMLSpanElement>);
        }
      }}
    >
      ✕
    </span>
  );
}
