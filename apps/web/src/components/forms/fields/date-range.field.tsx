import { DatePickerWithRange } from "~/components/date-picker";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type UseFormReturn } from "react-hook-form";

import { type DateRange } from "react-day-picker";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { type FilterNamesByValue } from "./type-helper";

interface DateRangeFieldProps<Form extends UseFormReturn> {
  form: Form;
  name: FilterNamesByValue<Form, DateRange | null | undefined>;
  placeholder?: string;
  description?: string;
  label: string;
}
export function DateRangeField<Form extends UseFormReturn<any>>(
  props: DateRangeFieldProps<Form>
) {
  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{props.label}</FormLabel>
          <DatePickerWithRange
            value={field.value}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            onChange={field.onChange}
            placeholder={props.placeholder}
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
