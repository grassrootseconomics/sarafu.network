/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { isAddress } from "viem";
import ScanAddressDialog from "~/components/dialogs/scan-address-dialog";
import { Loading } from "~/components/loading";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";
import { type FilterNamesByValue } from "./type-helper";

interface AddressFieldProps<Form extends UseFormReturn<any>> {
  form: Form;
  name: FilterNamesByValue<Form, string>;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  label: string;
}
export function AddressField<Form extends UseFormReturn<any>>(
  props: AddressFieldProps<Form>
) {
  const [inputValue, setInputValue] = useState<string>("");
  const { refetch, isFetching } = api.user.getAddressBySearchTerm.useQuery(
    {
      searchTerm: inputValue,
    },
    { enabled: false, gcTime: 0 }
  );

  const handleChange = (value: string) => {
    if (value === inputValue) return;
    setInputValue(value);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    props.form.setValue(props.name, value, { shouldValidate: true });
  };
  const handleBlur = async () => {
    if (!inputValue || isAddress(inputValue)) return;
    const d = await refetch();
    if (d.data?.blockchain_address && isAddress(d.data.blockchain_address)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      props.form.setValue(props.name, d.data.blockchain_address, {
        shouldValidate: true,
      });
      setInputValue(d.data.blockchain_address); // ensure it's necessary
    }
  };

  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{props.label}</FormLabel>
            <FormControl>
              <div className="relative flex gap-2">
                <Input
                  containerClassName="flex-grow"
                  disabled={props.disabled}
                  placeholder={
                    props.placeholder ?? "Address, Alias or Phone number"
                  }
                  value={inputValue}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={() => {
                    handleBlur()
                      .then(() => {
                        field.onBlur();
                      })
                      .catch(console.error);
                  }}
                  ref={field.ref}
                  endAdornment={isFetching && <Loading />}
                />
                <ScanAddressDialog
                  disabled={props.disabled}
                  onAddress={handleChange}
                />
              </div>
            </FormControl>
            {props.description && (
              <FormDescription>{props.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
