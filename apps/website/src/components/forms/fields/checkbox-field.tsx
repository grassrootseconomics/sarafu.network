/* eslint-disable @typescript-eslint/no-explicit-any */
import { type UseFormReturn } from "react-hook-form";
import { Checkbox } from "~/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { cn } from "~/lib/utils";
import { type FilterNamesByValue } from "./type-helper";

interface CheckBoxFieldProps<Form extends UseFormReturn> {
  form: Form;
  name: FilterNamesByValue<Form, boolean>;
  description?: string;
  disabled?: boolean;
  label?: string | React.ReactNode;
  className?: string;
}
export function CheckBoxField<Form extends UseFormReturn<any>>(
  props: CheckBoxFieldProps<Form>
) {
  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex flex-row items-start space-x-3 space-y-0 rounded-md p-4",
            props.className
          )}
        >
          <FormControl>
            <Checkbox
              disabled={props.disabled}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {props.label && <FormLabel>{props.label}</FormLabel>}
            {props.description && (
              <FormDescription>{props.description}</FormDescription>
            )}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
