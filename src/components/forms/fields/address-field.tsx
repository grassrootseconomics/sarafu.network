"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
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
import { useENSAddress } from "~/lib/sarafu/resolver";
import { isPhoneNumber } from "~/utils/phone-number";
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
  // Normalize ENS name (derived from debouncedValue)
  const normalizedEnsName = useMemo(() => {
    try {
      if (debouncedValue && !isAddress(debouncedValue)) {
        return normalize(debouncedValue);
      }
      return null;
    } catch (e) {
      // Handle potential normalization errors, e.g., invalid characters
      console.error("ENS normalization error:", e);
      return null;
    }
  }, [debouncedValue]);

  // Resolve ENS name
  const {
    data: ensData,
    isLoading: isEnsLoading,
    isError: isEnsError,
  } = useENSAddress({
    ensName: normalizedEnsName ?? "",
  });

  // Query backend only if it's not an address and not a potential ENS name
  const shouldQueryPhoneNumber = Boolean(
    debouncedValue &&
      !isAddress(debouncedValue) &&
      isPhoneNumber(debouncedValue) &&
      !debouncedValue.includes(".eth")
  );
  const phoneLookup = useLookupPhoneNumber(
    debouncedValue,
    shouldQueryPhoneNumber
  );

  const isLoading = isEnsLoading || phoneLookup.isLoading;

  const handleChange = (value: string) => {
    if (value === inputValue) return;
    setInputValue(value);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    props.form.setValue(props.name, value, { shouldValidate: true });
  };

  // Update form value when ENS resolution is successful
  const [prevEnsData, setPrevEnsData] = useState(ensData);
  if (ensData !== prevEnsData) {
    setPrevEnsData(ensData);
    if (ensData && isAddress(ensData.address)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      props.form.setValue(props.name, ensData.address, {
        shouldValidate: true,
      });
    }
  }

  // Update form value when tRPC query returns a valid blockchain address
  const [prevPhoneLookupData, setPrevPhoneLookupData] = useState(
    phoneLookup.data
  );
  if (phoneLookup.data !== prevPhoneLookupData) {
    setPrevPhoneLookupData(phoneLookup.data);
    if (phoneLookup.data && isAddress(phoneLookup.data)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      props.form.setValue(props.name, phoneLookup.data, {
        shouldValidate: true,
      });
      setInputValue(phoneLookup.data);
    }
  }

  // Handle ENS resolution error
  const [prevEnsError, setPrevEnsError] = useState(isEnsError);
  const [prevNormalizedName, setPrevNormalizedName] = useState(normalizedEnsName);
  if (isEnsError !== prevEnsError || normalizedEnsName !== prevNormalizedName) {
    setPrevEnsError(isEnsError);
    setPrevNormalizedName(normalizedEnsName);
    if (isEnsError && normalizedEnsName) {
      console.warn(`Could not resolve ENS name: ${normalizedEnsName}`);
    }
  }

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
                    props.placeholder ?? "Address, ENS Name or Phone number"
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
