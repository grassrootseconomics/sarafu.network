/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FieldPath, type UseFormReturn } from "react-hook-form";
import GetAddressDialog from "~/components/dialogs/get-address-dialog";
import ScanAddressDialog from "~/components/dialogs/scan-address-dialog";
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

interface AddressFieldProps<Form extends UseFormReturn> {
  form: Form;
  name: FieldPath<FormValues<Form>>;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  label: string;
}
export function AddressField<Form extends UseFormReturn<any>>(
  props: AddressFieldProps<Form>
) {
  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{props.label}</FormLabel>
          <FormControl>
            <div className="relative flex gap-2">
              <Input
                disabled={props.disabled}
                placeholder={props.placeholder ?? "0x..."}
                {...field}
                value={field.value || ""}
              />
              <GetAddressDialog onAddress={field.onChange} />
              <ScanAddressDialog
                disabled={props.disabled}
                onAddress={field.onChange}
              />
            </div>
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
