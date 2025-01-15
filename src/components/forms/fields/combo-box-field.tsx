/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Check, ChevronsUpDown, PlusIcon, XIcon } from "lucide-react";
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

import { Loading } from "~/components/loading";
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

export interface ComboBoxSingleFieldProps<
  TOption,
  TValue extends string | number,
  Form extends UseFormReturn<any>,
> {
  form: Form;
  name: FieldPath<FormValues<Form>>;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  label?: string;
  options: TOption[];
  getValue: (option: TOption) => TValue;
  getLabel: (option: TOption) => string;
  className?: string;
  onCreate?: (value: string) => Promise<TOption>;
  mode: "single";
}

export interface ComboBoxMultipleFieldProps<
  TOption,
  TValue extends string | number,
  Form extends UseFormReturn<any>,
> {
  form: Form;
  name: FieldPath<FormValues<Form>>;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  label?: string;
  options: TOption[];
  getValue: (option: TOption) => TValue;
  getLabel: (option: TOption) => string;
  className?: string;
  onCreate?: (value: string) => Promise<TOption>;
  mode: "multiple";
}

export type ComboBoxFieldProps<
  TOption,
  TValue extends string | number,
  Form extends UseFormReturn<any>,
> =
  | ComboBoxSingleFieldProps<TOption, TValue, Form>
  | ComboBoxMultipleFieldProps<TOption, TValue, Form>;
export function ComboBoxField<
  TOption,
  TValue extends string | number,
  Form extends UseFormReturn<any>,
>(
  props:
    | ComboBoxSingleFieldProps<TOption, TValue, Form>
    | ComboBoxMultipleFieldProps<TOption, TValue, Form>
) {
  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => {
        return (
          <FormItem className={cn("space-y-3 flex flex-col", props.className)}>
            {props.label && <FormLabel>{props.label}</FormLabel>}
            <FormControl>
              <ComboBoxResponsive<TOption, TValue>
                onChange={field.onChange}
                options={props.options ?? []}
                placeholder={props.placeholder}
                getValue={props.getValue}
                getLabel={props.getLabel}
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
        );
      }}
    />
  );
}

interface RComboBoxBaseProps<TOption, TValue> {
  disabled?: boolean;
  placeholder?: string;
  onCreate?: (query: string) => Promise<TOption>;
  getValue: (option: TOption) => TValue;
  getLabel: (option: TOption) => string;
}

interface RComboBoxSingleProps<TOption, TValue>
  extends RComboBoxBaseProps<TOption, TValue> {
  options: TOption[];
  onChange: (value: TValue) => void;
  initialValue: TValue;
  mode: "single";
}
interface RComboBoxMultipleProps<TOption, TValue>
  extends RComboBoxBaseProps<TOption, TValue> {
  options: TOption[];
  onChange: (value: TValue[]) => void;
  initialValue: TValue[];
  mode: "multiple";
}

type RComboBoxProps<TOption, TValue> =
  | RComboBoxSingleProps<TOption, TValue>
  | RComboBoxMultipleProps<TOption, TValue>;
export function ComboBoxResponsive<TOption, TValue extends string | number>(
  props: RComboBoxProps<TOption, TValue>
) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selected, setSelected] = React.useState<
    TOption | TOption[] | undefined
  >(
    props.mode === "single"
      ? props.options.find((o) => props.getValue(o) === props.initialValue)
      : props.options.filter((o) =>
          props.initialValue.includes(props.getValue(o))
        )
  );

  const handleChange = (option: TOption | TOption[]) => {
    setSelected(option);
    if (props.mode === "single") {
      const value = props.getValue(option as TOption);
      props.onChange(value);
    } else {
      const value = (option as TOption[]).map((o) => props.getValue(o));
      props.onChange(value);
    }
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
                  <Badge variant="outline" key={props.getValue(item)}>
                    {props.getLabel(item)}
                    <XIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChange(
                          selected.filter(
                            (s) => props.getValue(s) !== props.getValue(item)
                          )
                        );
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
            getValue={props.getValue}
            getLabel={props.getLabel}
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
                <Badge variant="outline" key={props.getValue(item)}>
                  {props.getLabel(item)}
                  <XIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(
                        selected.filter(
                          (s) => props.getValue(s) !== props.getValue(item)
                        )
                      );
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
            getValue={props.getValue}
            getLabel={props.getLabel}
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

function StatusList<TOption, TValue extends string | number>({
  setOpen,
  setSelected,
  options,
  placeholder,
  getValue,
  getLabel,
  onCreate,
  selected,
  mode = "single",
}: {
  setOpen: (open: boolean) => void;
  setSelected: (status: TOption | TOption[]) => void;
  options: TOption[];
  placeholder?: string;
  getValue: (option: TOption) => TValue;
  getLabel: (option: TOption) => string;
  onCreate?: (query: string) => Promise<TOption>;
  selected: TOption | TOption[] | undefined;
  mode?: "single" | "multiple";
}) {
  const [creating, setCreating] = React.useState(false);
  const [query, setQuery] = React.useState<string>("");
  function handleSelect(option: TOption) {
    if (mode === "multiple") {
      const newSelected = Array.isArray(selected)
        ? selected.find((item) => getValue(item) === getValue(option))
          ? selected.filter((item) => getValue(item) !== getValue(option))
          : [...selected, option]
        : [option];
      setSelected(newSelected);
    } else {
      setSelected(option);
      setOpen(false);
    }
  }
  async function handleCreate() {
    if (onCreate) {
      try {
        setCreating(true);
        const result = await onCreate(query);
        handleSelect(result);
      } catch (error) {
        console.error(error);
      } finally {
        setCreating(false);
      }
    }
  }
  return (
    <Command>
      <CommandInput
        placeholder={placeholder}
        value={query}
        onValueChange={(value: string) => setQuery(value)}
      />
      <CommandList>
        <CommandEmpty
          onClick={handleCreate}
          className="flex cursor-pointer items-center justify-center space-x-2 rounded-md p-4 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {creating ? (
            <Loading />
          ) : (
            <>
              <PlusIcon className="h-4 w-4" />
              <span>
                Create &quot;<strong className="font-semibold">{query}</strong>
                &quot;
              </span>
            </>
          )}
        </CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={getValue(option)}
              value={getLabel(option)}
              onSelect={() => {
                handleSelect(option);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  Array.isArray(selected)
                    ? selected.find(
                        (item) => getValue(item) === getValue(option)
                      )
                      ? "opacity-100"
                      : "opacity-0"
                    : selected && getValue(selected) === getValue(option)
                      ? "opacity-100"
                      : "opacity-0"
                )}
              />
              {getLabel(option)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
