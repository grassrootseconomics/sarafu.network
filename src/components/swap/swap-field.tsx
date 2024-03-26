/* eslint-disable @typescript-eslint/no-explicit-any */
import { type UseFormReturn } from "react-hook-form";

import { FormControl, FormField } from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { InputField, type InputFieldProps } from "../forms/fields/input-field";
import { type SelectFieldProps } from "../forms/fields/select-field";
import { type SwapPoolVoucher } from "./types";

interface SwapFieldProps<Form extends UseFormReturn> {
  form: Form;
  inputProps: Omit<InputFieldProps<Form>, "form">;
  selectProps: Omit<SelectFieldProps<Form>, "label" | "form" | "items"> & {
    items: SwapPoolVoucher[];
  };
  getLabel: (v: SwapPoolVoucher) => string;
}
export function SwapField<Form extends UseFormReturn<any>>(
  props: SwapFieldProps<Form>
) {
  return (
    <InputField
      form={props.form}
      inputClassName="h-20 text-xl"
      {...props.inputProps}
      endAdornment={
        <FormField
          control={props.form.control}
          name={props.selectProps.name}
          render={({ field }) => (
            <Select
              disabled={props.selectProps.disabled}
              onValueChange={(address) =>
                field.onChange(
                  props.selectProps.items.find((i) => i.address === address)
                )
              }
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              defaultValue={field.value?.address}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={props.selectProps.placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup className="overflow-y-auto max-h-[10rem]">
                  {props.selectProps.items.map((item, idx) => (
                    <SelectItem
                      key={`select-form-item-${props.selectProps.name}-${idx}`}
                      value={item.address}
                    >
                      {props.getLabel(item)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
      }
    />
  );
}
