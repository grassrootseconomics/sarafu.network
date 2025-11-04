"use client";

import { type UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { cn } from "~/lib/utils";
import { getFormFieldValue } from "./hooks/use-form-field-value";
import { SelectVoucher } from "./select-voucher";
import { type SelectVoucherFieldProps } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SelectVoucherField<T, Form extends UseFormReturn<any, any, any>>(
  props: SelectVoucherFieldProps<T, Form>
) {
  const isMultiSelect = props.isMultiSelect ?? false;

  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => {
        const { selectedItems, singleSelectedItem } = getFormFieldValue({
          fieldValue: field.value,
          items: props.items,
          getFormValue: props.getFormValue,
          getSelectedValue: props.getSelectedValue,
          isMultiSelect,
        });

        return (
          <FormItem className={cn("space-y-2 flex flex-col", props.className)}>
            {props.label && <FormLabel>{props.label}</FormLabel>}
            <FormControl>
              {isMultiSelect ? (
                <SelectVoucher
                  isMultiSelect={true}
                  onChange={(items) => {
                    field.onChange(items.map((item) => props.getFormValue(item)));
                  }}
                  items={props.items}
                  placeholder={props.placeholder}
                  value={selectedItems}
                  disabled={props.disabled}
                  renderSelectedItem={props.renderSelectedItem}
                  searchableValue={props.searchableValue}
                  renderItem={props.renderItem}
                />
              ) : (
                <SelectVoucher
                  isMultiSelect={false}
                  onChange={(item) => {
                    field.onChange(item ? props.getFormValue(item) : null);
                  }}
                  items={props.items}
                  placeholder={props.placeholder}
                  value={singleSelectedItem}
                  disabled={props.disabled}
                  renderSelectedItem={props.renderSelectedItem}
                  searchableValue={props.searchableValue}
                  renderItem={props.renderItem}
                />
              )}
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
