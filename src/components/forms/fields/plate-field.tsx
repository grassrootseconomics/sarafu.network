/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FieldPath, type UseFormReturn } from "react-hook-form";
import PlateEditor from "~/components/plate-editor";
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
  inputClassName?: string;
}
export function PlateField<Form extends UseFormReturn<any>>(
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
            <PlateEditor
              {...field}
              disabled={props.disabled ?? false}
              initialValue={field.value ?? ""}
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
