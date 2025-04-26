"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAddress } from "wagmi";
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
import { useLookupPhoneNumber } from "~/lib/sarafu/lookup";
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
  const [normalizedEnsName, setNormalizedEnsName] = useState<string | null>(
    null
  );

  // Normalize ENS name
  useEffect(() => {
    try {
      if (debouncedValue && !isAddress(debouncedValue)) {
        const normalized = normalize(debouncedValue);
        console.log("normalized", normalized);
        setNormalizedEnsName(normalized);
      } else {
        setNormalizedEnsName(null);
      }
    } catch (e) {
      // Handle potential normalization errors, e.g., invalid characters
      console.error("ENS normalization error:", e);
      setNormalizedEnsName(null);
    }
  }, [debouncedValue]);

  // Resolve ENS name
  const {
    data: ensAddress,
    isLoading: isEnsLoading,
    isError: isEnsError,
  } = useEnsAddress({
    chainId: 1,
    name: normalizedEnsName ?? undefined,
  });

  // Query backend only if it's not an address and not a potential ENS name
  const shouldQuery = Boolean(
    debouncedValue &&
      !isAddress(debouncedValue) &&
      !debouncedValue.includes(".eth")
  );

  const phoneLookup = useLookupPhoneNumber(debouncedValue, shouldQuery);

  const isLoading = isEnsLoading || phoneLookup.isLoading;

  const handleChange = (value: string) => {
    if (value === inputValue) return;
    setInputValue(value);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    props.form.setValue(props.name, value, { shouldValidate: true });
  };

  // Update form value when ENS resolution is successful
  useEffect(() => {
    if (ensAddress && isAddress(ensAddress)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      props.form.setValue(props.name, ensAddress, {
        shouldValidate: true,
      });
      // Optionally update input value to show the resolved address
      // setInputValue(ensAddress)
    }
  }, [ensAddress, props.form, props.name]);

  // Update form value when tRPC query returns a valid blockchain address
  useEffect(() => {
    if (phoneLookup.data && isAddress(phoneLookup.data)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      props.form.setValue(props.name, phoneLookup.data, {
        shouldValidate: true,
      });
      setInputValue(phoneLookup.data);
    }
  }, [phoneLookup.data, props.form, props.name]);

  // Handle ENS resolution error - potentially clear input or show error
  useEffect(() => {
    if (isEnsError && normalizedEnsName) {
      // Clear the specific error related to this field if possible
      // props.form.setError(props.name, { type: "manual", message: "Invalid ENS name" });
      console.warn(`Could not resolve ENS name: ${normalizedEnsName}`);
      // Optionally clear the form field if ENS resolution fails
      // props.form.setValue(props.name, "", { shouldValidate: true });
    }
  }, [isEnsError, normalizedEnsName, props.form, props.name]);

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
                    "Address, ENS Name, Shortcode, Alias or Phone number"
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
