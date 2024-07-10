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
export interface SelectVoucherFieldProps<
  T extends object,
  Form extends UseFormReturn,
> {
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
}
export function SelectVoucherField<
  T extends object,
  Form extends UseFormReturn<any>,
>(props: SelectVoucherFieldProps<T, Form>) {
  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={cn("space-y-1 flex flex-col", props.className)}>
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <FormControl>
            <SelectVoucher
              onChange={(item) =>
                field.onChange(item ? props.getFormValue(item) : null)
              }
              items={props.items}
              placeholder={props.placeholder}
              value={
                props.items.find(
                  (v) => props.getFormValue(v) === field.value
                ) ?? null
              }
              disabled={props.disabled}
              renderSelectedItem={props.renderSelectedItem}
              searchableValue={props.searchableValue}
              renderItem={props.renderItem}
              key={props.name}
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

export interface SelectVoucherProps<T extends object> {
  disabled?: boolean;
  items: T[];
  onChange: (item: T | null) => void;
  value: T | null;
  renderItem: (item: T) => React.ReactNode;
  renderSelectedItem: (item: T) => React.ReactNode;
  searchableValue: (item: T) => string;
  placeholder?: string;
}
export function SelectVoucher<T extends object>(props: SelectVoucherProps<T>) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selected, setSelected] = React.useState<T | null>(props.value);
  const handleChange = (item: T | null) => {
    setSelected(item);
    props.onChange(item);
  };
  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start flex-col"
            disabled={props.disabled}
          >
            {selected ? (
              props.renderSelectedItem(selected)
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
            searchableValue={props.searchableValue}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="justify-start">
          {selected ? (
            <>{props.renderItem(selected)}</>
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
            searchableValue={props.searchableValue}
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
}: {
  setOpen: (open: boolean) => void;
  setSelected: (status: T | null) => void;
  renderItem: (item: T) => React.ReactNode;
  searchableValue: (item: T) => string;
  items: T[];
  placeholder?: string;
}) {
  return (
    <Command>
      <CommandInput placeholder={"Search..."} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {items?.map((v, idx) => (
            <CommandItem
              key={"select-item-" + idx}
              value={searchableValue(v)}
              className="cursor-pointer"
              onSelect={() => {
                setSelected(v || null);
                setOpen(false);
              }}
            >
              {renderItem(v)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
