"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
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
import { useDebounce } from "~/hooks/use-debounce";
import { trpc } from "~/lib/trpc";
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
  const [inputValue, setInputValue] = useState<string>(
    props.form.getValues(props.name)
  );
  const debouncedValue = useDebounce(inputValue, 500);

  // Only query if we have a debounced value and it's not already a valid address
  const shouldQuery = Boolean(debouncedValue && !isAddress(debouncedValue));
  const { data, isLoading } = trpc.user.getAddressBySearchTerm.useQuery(
    {
      searchTerm: debouncedValue,
    },
    {
      enabled: shouldQuery,
      gcTime: 0,
    }
  );

  const handleChange = (value: string) => {
    if (value === inputValue) return;
    setInputValue(value);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    props.form.setValue(props.name, value, { shouldValidate: true });
  };

  // Update form value when query returns a valid blockchain address
  useEffect(() => {
    if (!data?.blockchain_address || !isAddress(data.blockchain_address))
      return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    props.form.setValue(props.name, data.blockchain_address, {
      shouldValidate: true,
    });
    setInputValue(data.blockchain_address);
  }, [data, props.form, props.name]);

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
                    props.placeholder ??
                    "Address, Shortcode, Alias or Phone number"
                  }
                  value={inputValue}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  endAdornment={isLoading && <Loading />}
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
