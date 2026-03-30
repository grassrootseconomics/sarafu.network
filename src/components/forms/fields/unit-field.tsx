"use client";
import { useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { ComboBoxField } from "./combo-box-field";

interface UnitOption {
  value: string;
  label: string;
}

const DEFAULT_UNIT_OPTIONS: UnitOption[] = [
  { value: "kg", label: "Kilogram" },
  { value: "g", label: "Gram" },
  { value: "litre", label: "Litre" },
  { value: "item", label: "Item" },
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "bag", label: "Bag" },
  { value: "unit", label: "Unit" },
  { value: "bundle", label: "Bundle" },
  { value: "piece", label: "Piece" },
  { value: "dozen", label: "Dozen" },
  { value: "serving", label: "Serving" },
  { value: "trip", label: "Trip" },
  { value: "session", label: "Session" },
  { value: "metre", label: "Metre" },
];

interface UnitFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  description?: string;
}

export function UnitField({
  form,
  name,
  label = "Per (unit of measure)",
  placeholder = "Select or type your own",
  className,
  description,
}: UnitFieldProps) {
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>(() => {
    const currentValue = form.getValues(name) as string | undefined;
    if (
      currentValue &&
      !DEFAULT_UNIT_OPTIONS.some((o) => o.value === currentValue)
    ) {
      return [
        { value: currentValue, label: "Custom" },
        ...DEFAULT_UNIT_OPTIONS,
      ];
    }
    return [...DEFAULT_UNIT_OPTIONS];
  });

  const handleCreateUnit = (query: string): UnitOption => {
    const newOption: UnitOption = { value: query, label: "Custom" };
    setUnitOptions((prev) => [...prev, newOption]);
    return newOption;
  };

  return (
    <ComboBoxField
      form={form}
      name={name}
      label={label}
      className={className}
      placeholder={placeholder}
      description={description}
      options={unitOptions}
      getValue={(option) => option.value}
      getLabel={(option) => `${option.label}`}
      onCreate={handleCreateUnit}
      mode="single"
    />
  );
}
