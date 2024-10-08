/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FieldPath, type UseFormReturn } from "react-hook-form";
import { type FormValues } from "./type-helper";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

export interface SelectFieldProps<Form extends UseFormReturn> {
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
  className?: string;
}
export function SelectField<Form extends UseFormReturn<any>>(
  props: SelectFieldProps<Form>
) {
  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={cn("space-y-1", props.className)}>
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <Select
            disabled={props.disabled}
            onValueChange={field.onChange}
            defaultValue={`${field.value}`}
            value={`${field.value}`}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={props.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup className="overflow-y-auto max-h-[10rem]">
                {props.items.map((item, idx) => (
                  <SelectItem
                    key={`select-form-item-${props.name}-${idx}`}
                    // eslint-disable-next-line
                    // @ts-ignore
                    value={item.value}
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {props.description && (
            <FormDescription>{props.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
