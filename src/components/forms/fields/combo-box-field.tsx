/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Check, ChevronsUpDown } from "lucide-react";
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
export interface ComboBoxFieldProps<T, Form extends UseFormReturn> {
  form: Form;
  name: FieldPath<FormValues<Form>>;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  label?: string;
  getValue: (option: T) => string;
  getLabel: (option: T) => string;
  options: T[];
  className?: string;
}
export function ComboBoxField<T, Form extends UseFormReturn<any>>(
  props: ComboBoxFieldProps<T, Form>
) {
  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={cn("space-y-1 flex flex-col", props.className)}>
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <FormControl>
            <ComboBoxResponsive
              onChange={(v) => field.onChange(v?.value ?? null)}
              options={props.options.map((option) => ({
                value: props.getValue(option),
                label: props.getLabel(option),
              }))}
              placeholder={props.placeholder}
              initialValue={field.value}
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

interface ComboboxDemoProps<T> {
  initialValue?: T;
  options: T[];
  getValue: (option: T) => string;
  getLabel: (option: T) => string;
  onChange: (value: T) => void;
}
export function Combobox<T>(props: ComboboxDemoProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<T | undefined>(props.initialValue);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value ? props.getLabel(value) : "Select framework..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {props.options.map((option) => (
              <CommandItem
                key={props.getValue(option)}
                value={props.getLabel(option)}
                onSelect={(currentValue) => {
                  setValue(
                    value && currentValue === props.getValue(value)
                      ? undefined
                      : option
                  );
                  setOpen(false);
                  props.onChange(option);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === props.getValue(option)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {props.getLabel(option)}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type Option = {
  value: string;
  label: string;
};

interface RComboBoxProps {
  disabled?: boolean;
  options: Option[];
  onChange: (value: Option | null) => void;
  initialValue: Option | null;
  placeholder?: string;
}
export function ComboBoxResponsive(props: RComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selected, setSelected] = React.useState<Option | null>(
    props.initialValue
  );
  const handleChange = (value: Option | null) => {
    setSelected(value);
    props.onChange(value);
  };
  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start"
            disabled={props.disabled}
          >
            {selected ? <>{selected.label}</> : <>{props.placeholder}</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <StatusList
            options={props.options}
            setOpen={setOpen}
            setSelected={handleChange}
            placeholder={props.placeholder}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start">
          {selected ? <>{selected.label}</> : <>{props.placeholder}</>}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <StatusList
            options={props.options}
            setOpen={setOpen}
            setSelected={handleChange}
            placeholder={props.placeholder}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function StatusList({
  setOpen,
  setSelected,
  options,
  placeholder,
}: {
  setOpen: (open: boolean) => void;
  setSelected: (status: Option | null) => void;
  options: Option[];
  placeholder?: string;
}) {
  return (
    <Command>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={option.label}
              onSelect={(value) => {
                setSelected(
                  options?.find((o) => o.label.toLowerCase() === value) || null
                );
                setOpen(false);
              }}
            >
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
