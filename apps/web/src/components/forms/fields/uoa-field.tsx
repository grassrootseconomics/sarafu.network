"use client";
import { useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { ALL_UOA_OPTIONS, type UoaOption } from "@sarafu/core/currencies";
import { ComboBoxField } from "./combo-box-field";

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
  // Initialize options, adding currentValue as custom if not in defaults
  const [uoaOptions, setUoaOptions] = useState<UoaOption[]>(() => {
    if (currentValue && !ALL_UOA_OPTIONS.some((o) => o.code === currentValue)) {
      return [{ code: currentValue, name: "Custom" }, ...ALL_UOA_OPTIONS];
    }
    return [...ALL_UOA_OPTIONS];
  });

  // Handler to create a new UOA option
  const handleCreateUoa = (query: string): UoaOption => {
    const newOption: UoaOption = { code: query, name: "Custom" };
    setUoaOptions((prev) => [...prev, newOption]);
    return newOption;
  };

  return (
    <ComboBoxField
      form={form}
      name={name}
      label={label}
      placeholder={placeholder}
      description={description}
      options={uoaOptions}
      getValue={(option) => option.code}
      getLabel={(option) => `${option.code} - ${option.name}`}
      onCreate={handleCreateUoa}
      mode="single"
    />
  );
}
