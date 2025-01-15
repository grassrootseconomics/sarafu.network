/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FieldPath, type UseFormReturn } from "react-hook-form";
import PlateEditor from "~/components/plate/editor";
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
  image_name?: string;
  description_name?: string;
  title_name?: string;
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
              onChange={(content, heading, image, description) => {
                console.log({ heading, image, description });
                if (props.title_name) {
                  props.form.setValue(props.title_name, heading);
                }
                if (props.description_name) {
                  props.form.setValue(props.description_name, description);
                }
                if (props.image_name) {
                  props.form.setValue(props.image_name, image);
                }
                field.onChange(content);
              }}
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
