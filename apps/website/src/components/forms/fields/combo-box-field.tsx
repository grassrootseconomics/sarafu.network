/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Check, ChevronsUpDown, XIcon } from "lucide-react";
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

export interface ComboBoxFieldProps<T, Form extends UseFormReturn<any>> {
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
  onCreate?: (value: string) => void;
  mode?: "single" | "multiple";
}

export function ComboBoxField<T, Form extends UseFormReturn<any>>(
  props: ComboBoxFieldProps<T, Form>
) {
  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={cn("space-y-3 flex flex-col", props.className)}>
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <FormControl>
            <ComboBoxResponsive
              onChange={(v) => field.onChange(v)}
              options={props.options.map((option) => ({
                value: props.getValue(option),
                label: props.getLabel(option),
              }))}
              placeholder={props.placeholder}
              initialValue={field.value}
              key={props.name}
              onCreate={props.onCreate}
              mode={props.mode}
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

type Option = {
  value: string;
  label: string;
};

interface RComboBoxProps {
  disabled?: boolean;
  options: Option[];
  onChange: (value: string | string[]) => void;
  initialValue: string | string[];
  placeholder?: string;
  onCreate?: (value: string) => void;
  mode?: "single" | "multiple";
}

export function ComboBoxResponsive(props: RComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selected, setSelected] = React.useState<string | string[]>(
    props.initialValue
  );
  const handleChange = (value: string | string[]) => {
    setSelected(value);
    props.onChange(value);
  };

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={props.disabled}
            className="w-full justify-between h-[unset]"
          >
            {selected && Array.isArray(selected) && selected.length > 0 ? (
              <div className="flex flex-row gap-2 flex-wrap w-full">
                {selected.map((item) => (
                  <Badge variant="outline" key={item}>
                    {item}
                    <XIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChange(selected.filter((s) => s !== item));
                      }}
                      className="ml-2 h-4 w-4 shrink-0 opacity-50"
                    />
                  </Badge>
                ))}
              </div>
            ) : (
              props.placeholder ?? "Select an item"
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <StatusList
            options={props.options}
            setOpen={setOpen}
            setSelected={handleChange}
            placeholder={props.placeholder}
            onCreate={props.onCreate}
            selected={selected}
            mode={props.mode}
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
          disabled={props.disabled}
          className="w-full justify-between h-[unset]"
        >
          {selected && Array.isArray(selected) && selected.length > 0 ? (
            <div className="flex flex-row gap-2 flex-wrap w-full">
              {selected.map((item) => (
                <Badge variant="outline" key={item}>
                  {item}
                  <XIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(selected.filter((s) => s !== item));
                    }}
                    className="ml-2 h-4 w-4 shrink-0 opacity-50"
                  />
                </Badge>
              ))}
            </div>
          ) : (
            props.placeholder ?? "Select an item"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t pb-8">
          <StatusList
            options={props.options}
            setOpen={setOpen}
            setSelected={handleChange}
            placeholder={props.placeholder}
            onCreate={props.onCreate}
            selected={selected}
            mode={props.mode}
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
  onCreate,
  selected,
  mode = "single",
}: {
  setOpen: (open: boolean) => void;
  setSelected: (status: string | string[]) => void;
  options: Option[];
  placeholder?: string;
  onCreate?: (value: string) => void;
  selected: string | string[];
  mode?: "single" | "multiple";
}) {
  const [query, setQuery] = React.useState<string>("");

  return (
    <Command>
      <CommandInput
        placeholder={placeholder}
        value={query}
        onValueChange={(value: string) => setQuery(value)}
      />
      <CommandList>
        <CommandEmpty
          onClick={() => {
            if (onCreate) {
              onCreate(query);
              setQuery("");
            }
          }}
        >
          <strong>Create:</strong>{query}
        </CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={option.label}
              onSelect={() => {
                if (mode === "multiple") {
                  const newSelected = Array.isArray(selected)
                    ? selected.includes(option.value)
                      ? selected.filter((item) => item !== option.value)
                      : [...selected, option.value]
                    : [option.value];
                  setSelected(newSelected);
                } else {
                  setSelected(option.value);
                }
                setOpen(false);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  Array.isArray(selected)
                    ? selected.includes(option.value)
                      ? "opacity-100"
                      : "opacity-0"
                    : selected === option.value
                      ? "opacity-100"
                      : "opacity-0"
                )}
              />
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
