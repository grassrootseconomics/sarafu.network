/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FieldPath, type UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { type FormValues } from "./type-helper";

interface RadioFieldProps<Form extends UseFormReturn> {
  form: Form;
  name: FieldPath<FormValues<Form>>;
  placeholder?: string;
  description?: string;
  label: string;
  disabled?: boolean;
  items: {
    value: string;
    label: string;
  }[];
}
export function RadioField<Form extends UseFormReturn<any>>(
  props: RadioFieldProps<Form>
) {
  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>{props.label}</FormLabel>
          <FormControl>
            <RadioGroup
              disabled={props.disabled}
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              {props.items.map((item, idx) => (
                <FormItem
                  key={`radio-form-item-${props.name}-${idx}`}
                  className="flex items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem value={item.value} />
                  </FormControl>
                  <FormLabel className="font-normal">{item.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
