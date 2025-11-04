import { type FieldPath, type UseFormReturn } from "react-hook-form";
import type React from "react";
import { type ReactNode } from "react";

// Constants
export const CONSTANTS = {
  FOCUS_DELAY_MS: 100,
  SEARCH_DEBOUNCE_MS: 300,
  VIRTUAL_ITEM_ESTIMATE_HEIGHT: 60,
  VIRTUAL_OVERSCAN_COUNT: 5,
  POPOVER_MIN_WIDTH: 320,
  POPOVER_MAX_WIDTH: 480,
  MAX_LIST_HEIGHT: 400,
  LIST_OFFSET: 120,
} as const;

// Helper type to extract form values
export type FormValues<T extends UseFormReturn> = T extends UseFormReturn<infer V>
  ? V
  : never;

// Base props shared by both single and multi-select
interface SelectVoucherPropsBase<T> {
  disabled?: boolean;
  items: T[];
  renderItem: (item: T) => ReactNode;
  renderSelectedItem: (item: T) => ReactNode;
  searchableValue: (item: T) => string;
  placeholder?: string;
}

// Single select props
export interface SingleSelectVoucherProps<T> extends SelectVoucherPropsBase<T> {
  isMultiSelect?: false;
  value: T | null;
  onChange: (item: T | null) => void;
}

// Multi select props
export interface MultiSelectVoucherProps<T> extends SelectVoucherPropsBase<T> {
  isMultiSelect: true;
  value: T[];
  onChange: (items: T[]) => void;
}

// Discriminated union
export type SelectVoucherProps<T> =
  | SingleSelectVoucherProps<T>
  | MultiSelectVoucherProps<T>;

// Form field props
interface SelectVoucherFieldPropsBase<
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Form extends UseFormReturn<any, any, any>
> {
  form: Form;
  name: FieldPath<FormValues<Form>>;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  label?: string;
  getFormValue: (item: T) => unknown;
  getSelectedValue?: (value: unknown) => unknown;
  searchableValue: (item: T) => string;
  renderSelectedItem: (item: T) => ReactNode;
  renderItem: (item: T) => ReactNode;
  items: T[];
  className?: string;
}

export interface SingleSelectVoucherFieldProps<
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Form extends UseFormReturn<any, any, any>
> extends SelectVoucherFieldPropsBase<T, Form> {
  isMultiSelect?: false;
}

export interface MultiSelectVoucherFieldProps<
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Form extends UseFormReturn<any, any, any>
> extends SelectVoucherFieldPropsBase<T, Form> {
  isMultiSelect: true;
}

export type SelectVoucherFieldProps<
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Form extends UseFormReturn<any, any, any>
> =
  | SingleSelectVoucherFieldProps<T, Form>
  | MultiSelectVoucherFieldProps<T, Form>;

// Trigger button props
export interface SelectTriggerButtonProps<T>
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  open: boolean;
  disabled?: boolean;
  selectedItems: T[];
  placeholder?: string;
  isMultiSelect: boolean;
  renderSelectedItem: (item: T) => ReactNode;
  onRemoveItem: (item: T) => void;
}

// Selected item badge props
export interface SelectedItemBadgeProps<T> {
  item: T;
  renderItem: (item: T) => ReactNode;
  onRemove?: (item: T) => void;
  isMultiSelect: boolean;
}

// Select list props
export interface SelectListProps<T> {
  items: T[];
  selectedItems: T[];
  isMultiSelect: boolean;
  searchableValue: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  onSelect: (item: T) => void;
  onClose: () => void;
}
