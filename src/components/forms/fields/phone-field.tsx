/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  AsYouType,
  type CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import { ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { type FieldPath, type UseFormReturn } from "react-hook-form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useDefaultPhoneCountry } from "~/hooks/use-default-phone-country";
import { cn } from "~/lib/utils";
import { type FormValues } from "./type-helper";

const COUNTRY_NAMES =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function countryLabel(code: CountryCode): string {
  return COUNTRY_NAMES?.of(code) ?? code;
}

function flagEmoji(code: CountryCode): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export interface PhoneFieldProps<Form extends UseFormReturn> {
  form: Form;
  /** Form field that stores the phone number (E.164 once valid). */
  name: FieldPath<FormValues<Form>>;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function PhoneField<Form extends UseFormReturn<any>>(
  props: PhoneFieldProps<Form>
) {
  const defaultCountry = useDefaultPhoneCountry();

  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <PhoneFieldInner
          field={field}
          defaultCountry={defaultCountry}
          label={props.label}
          description={props.description}
          placeholder={props.placeholder}
          disabled={props.disabled}
          className={props.className}
        />
      )}
    />
  );
}

interface PhoneFieldInnerProps {
  field: {
    value: unknown;
    onChange: (value: string | null) => void;
    onBlur: () => void;
  };
  defaultCountry: CountryCode;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Format a stored phone value for display in the input. We strip the country
// code so it isn't shown twice (the selector already shows it). For partial
// input that doesn't yet parse, `AsYouType` produces sensible national-style
// formatting.
function formatForDisplay(value: string, country: CountryCode): string {
  if (!value) return "";
  const parsed = parsePhoneNumberFromString(value, country);
  if (parsed) return parsed.formatNational();
  return new AsYouType(country).input(value);
}

function PhoneFieldInner({
  field,
  defaultCountry,
  label,
  description,
  placeholder,
  disabled,
  className,
}: PhoneFieldInnerProps) {
  const fieldValue =
    typeof field.value === "string" && field.value ? field.value : "";

  // Country: parsed from the current value when possible, else the default
  // (IP geo / locale / KE). Owned by this component after first render so the
  // user's country selection isn't clobbered by re-renders.
  const initialCountry = React.useMemo<CountryCode>(() => {
    if (fieldValue) {
      const parsed = parsePhoneNumberFromString(fieldValue);
      if (parsed?.country) return parsed.country;
    }
    return defaultCountry;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [country, setCountry] = React.useState<CountryCode>(initialCountry);

  // What's shown in the input. Kept in local state so partial input survives
  // re-renders even when it doesn't yet parse to a valid E.164.
  const [display, setDisplay] = React.useState(() =>
    formatForDisplay(fieldValue, initialCountry)
  );

  // If the form value changes externally (e.g. defaultValues hydrate from
  // server data), reformat the display value.
  const lastSyncedValue = React.useRef(fieldValue);
  React.useEffect(() => {
    if (fieldValue === lastSyncedValue.current) return;
    lastSyncedValue.current = fieldValue;
    setDisplay(formatForDisplay(fieldValue, country));
  }, [fieldValue, country]);

  const writeFormValue = (raw: string, forCountry: CountryCode) => {
    const cleaned = raw.replace(/[^\d+]+/g, "");
    if (!cleaned) {
      lastSyncedValue.current = "";
      field.onChange(null);
      return;
    }
    const parsed = parsePhoneNumberFromString(cleaned, forCountry);
    if (parsed?.isValid()) {
      lastSyncedValue.current = parsed.number;
      field.onChange(parsed.number);
    } else {
      lastSyncedValue.current = cleaned;
      field.onChange(cleaned);
    }
  };

  const handleInputChange = (next: string) => {
    setDisplay(new AsYouType(country).input(next));
    writeFormValue(next, country);
  };

  const handleCountryChange = (next: CountryCode) => {
    setCountry(next);
    setDisplay(new AsYouType(next).input(display));
    writeFormValue(display, next);
  };

  return (
    <FormItem className={className}>
      {label && <FormLabel>{label}</FormLabel>}
      <div className="flex gap-2">
        <CountrySelect
          value={country}
          onChange={handleCountryChange}
          disabled={disabled}
        />
        <FormControl>
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            disabled={disabled}
            placeholder={placeholder ?? "Phone number"}
            value={display}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={field.onBlur}
          />
        </FormControl>
      </div>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}

interface CountrySelectProps {
  value: CountryCode;
  onChange: (next: CountryCode) => void;
  disabled?: boolean;
}

function CountrySelect({ value, onChange, disabled }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  const countries = React.useMemo(() => {
    const codes = getCountries();
    return codes
      .map((code) => ({
        code,
        name: countryLabel(code),
        callingCode: getCountryCallingCode(code),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label="Select country"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "inline-flex h-10 items-center gap-1 rounded-md border border-input bg-background px-3 text-sm",
            "ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <span aria-hidden="true">{flagEmoji(value)}</span>
          <span className="tabular-nums">+{getCountryCallingCode(value)}</span>
          <ChevronsUpDown className="ml-1 h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((c) => (
                <CommandItem
                  key={c.code}
                  value={`${c.name} ${c.code} +${c.callingCode}`}
                  onSelect={() => {
                    onChange(c.code);
                    setOpen(false);
                  }}
                >
                  <span className="mr-2" aria-hidden="true">
                    {flagEmoji(c.code)}
                  </span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                    +{c.callingCode}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
