/* eslint-disable @typescript-eslint/no-explicit-any */
import { HTMLInputTypeAttribute } from "react";
import { type FieldPath, type UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { type FormValues } from "./type-helper";

interface InputFieldProps<Form extends UseFormReturn> {
  form: Form;
  name: FieldPath<FormValues<Form>>;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  label?: string;
  type?: HTMLInputTypeAttribute;
  className?: string;
}
export function InputField<Form extends UseFormReturn<any>>(
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
            <Input
              type={props.type}
              disabled={props.disabled}
              {...field}
              value={field.value ?? ""}
              placeholder={props.placeholder}
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
