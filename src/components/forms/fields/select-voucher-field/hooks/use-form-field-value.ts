import { useMemo } from "react";

interface FormFieldValueParams<T> {
  fieldValue: unknown;
  items: T[];
  getFormValue: (item: T) => unknown;
  getSelectedValue?: (value: unknown) => unknown;
  isMultiSelect: boolean;
}

interface FormFieldValueReturn<T> {
  selectedItems: T[];
  singleSelectedItem: T | null;
}

// Pure function version (can be called inside render callbacks)
export function getFormFieldValue<T>({
  fieldValue,
  items,
  getFormValue,
  getSelectedValue,
  isMultiSelect,
}: FormFieldValueParams<T>): FormFieldValueReturn<T> {
  // Normalize the comparison value
  const normalize = (value: unknown): unknown => {
    if (value == null) return null;
    const normalized = getSelectedValue ? getSelectedValue(value) : value;
    return normalized;
  };

  if (isMultiSelect) {
    // Handle multi-select
    const fieldArray = Array.isArray(fieldValue) ? fieldValue : [];
    const normalizedFieldValues = fieldArray
      .map(normalize)
      .filter((v) => v != null);

    const selectedItems = items.filter((item) => {
      const itemValue = normalize(getFormValue(item));
      return (
        itemValue != null &&
        normalizedFieldValues.some((value) => Object.is(value, itemValue))
      );
    });

    return { selectedItems, singleSelectedItem: null };
  } else {
    // Handle single-select
    const normalizedFieldValue = normalize(fieldValue);

    if (normalizedFieldValue == null) {
      return { selectedItems: [], singleSelectedItem: null };
    }

    const singleSelectedItem =
      items.find((item) => {
        const itemValue = normalize(getFormValue(item));
        return Object.is(itemValue, normalizedFieldValue);
      }) ?? null;

    return {
      selectedItems: singleSelectedItem ? [singleSelectedItem] : [],
      singleSelectedItem,
    };
  }
}

// Hook version (memoized, for use at component top-level)
export function useFormFieldValue<T>({
  fieldValue,
  items,
  getFormValue,
  getSelectedValue,
  isMultiSelect,
}: FormFieldValueParams<T>): FormFieldValueReturn<T> {
  return useMemo(
    () =>
      getFormFieldValue({
        fieldValue,
        items,
        getFormValue,
        getSelectedValue,
        isMultiSelect,
      }),
    [fieldValue, items, getFormValue, getSelectedValue, isMultiSelect]
  );
}
