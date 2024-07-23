/* eslint-disable @typescript-eslint/no-explicit-any */
import { type UseFormReturn } from "react-hook-form";

import { InputField, type InputFieldProps } from "../forms/fields/input-field";
import {
  SelectVoucherField,
  type SelectVoucherFieldProps,
} from "../forms/fields/select-voucher-field";
import { type SwapPoolVoucher } from "./types";

interface SwapFieldProps<Form extends UseFormReturn> {
  form: Form;
  inputProps: Omit<InputFieldProps<Form>, "form">;
  selectProps: SelectVoucherFieldProps<SwapPoolVoucher, Form>;
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
        <SelectVoucherField
          name={props.selectProps.name}
          getFormValue={props.selectProps.getFormValue}
          disabled={props.selectProps.disabled}
          searchableValue={props.selectProps.searchableValue}
          renderItem={props.selectProps.renderItem}
          renderSelectedItem={props.selectProps.renderSelectedItem}
          form={props.form}
          placeholder={props.selectProps.placeholder}
          items={props.selectProps.items}
        />
      }
    />
  );
}
