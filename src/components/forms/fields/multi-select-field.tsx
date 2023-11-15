/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FieldPath, type UseFormReturn } from "react-hook-form";
import { type FormValues } from "./type-helper";

import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { MultiSelect } from "~/components/ui/multi-select";

interface SelectFieldProps<Form extends UseFormReturn> {
  form: Form;
  name: FieldPath<FormValues<Form>>;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  label?: string;
  items: {
    value: string;
    label: string;
  }[];
}
export function MultiSelectField<Form extends UseFormReturn<any>>(
  props: SelectFieldProps<Form>
) {
  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <MultiSelect
            disabled={props.disabled}
            selected={field.value}
            options={props.items}
            {...field}
          />
          {props.description && (
            <FormDescription>{props.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
