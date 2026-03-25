/* eslint-disable @typescript-eslint/no-explicit-any */
import { type UseFormReturn } from "react-hook-form";

import { InputField, type InputFieldProps } from "../forms/fields/input-field";
import {
  SearchableSelectField,
  type SearchableSelectFieldProps,
} from "../forms/fields/searchable-select";
import { type SwapPoolVoucher } from "./types";

interface SwapFieldProps<Form extends UseFormReturn> {
  form: Form;
  inputProps: Omit<InputFieldProps<Form>, "form">;
  selectProps: SearchableSelectFieldProps<SwapPoolVoucher, Form>;
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
        <SearchableSelectField<SwapPoolVoucher, Form>
          {...props.selectProps}
          drawerTitle="Select Voucher"
          drawerDescription="Choose from available vouchers"
          searchPlaceholder="Search vouchers..."
          emptyLabel="No vouchers available"
          itemLabel="voucher"
        />
      }
    />
  );
}
