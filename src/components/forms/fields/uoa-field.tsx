"use client";
import { useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { ComboBoxField } from "./combo-box-field";

// Default Unit of Account options
export const DEFAULT_UOA_OPTIONS = ["USD", "EUR", "$COL", "KSH", "Hour"];

interface UoaFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  currentValue?: string;
}

export function UoaField({
  form,
  name,
  label = "Unit of Account",
  placeholder = "Select or type your own",
  description = "How do you measure the value of your voucher?",
  currentValue,
}: UoaFieldProps) {
  // Initialize options with current value if it's not in defaults
  const [uoaOptions, setUoaOptions] = useState(() => {
    return currentValue && !DEFAULT_UOA_OPTIONS.includes(currentValue)
      ? [...DEFAULT_UOA_OPTIONS, currentValue]
      : DEFAULT_UOA_OPTIONS;
  });

  // Handler to create a new UOA option
  const handleCreateUoa = (query: string) => {
    setUoaOptions([...uoaOptions, query]);
    return query;
  };

  return (
    <ComboBoxField
      form={form}
      name={name}
      label={label}
      placeholder={placeholder}
      description={description}
      options={uoaOptions}
      getValue={(option) => option}
      getLabel={(option) => option}
      onCreate={handleCreateUoa}
      mode="single"
    />
  );
}