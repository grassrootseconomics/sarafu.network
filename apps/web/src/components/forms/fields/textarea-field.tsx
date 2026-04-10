/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FieldPath, type UseFormReturn } from "react-hook-form";
import { AutosizeTextarea } from "~/components/ui/autosize-textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { type FormValues } from "./type-helper";

export interface InputFieldProps<Form extends UseFormReturn> {
  form: Form;
  name: FieldPath<FormValues<Form>>;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
  rows?: number;
  inputClassName?: string;
}
export function TextAreaField<Form extends UseFormReturn<any>>(
  props: InputFieldProps<Form>
) {
  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={props.className}>
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <FormControl>
            <AutosizeTextarea
              disabled={props.disabled}
              className={props.inputClassName}
              {...field}
              value={field.value ?? ""}
              placeholder={props.placeholder}
              rows={props.rows}
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
