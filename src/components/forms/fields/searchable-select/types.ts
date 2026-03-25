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
interface SearchableSelectPropsBase<T> {
  disabled?: boolean;
  items: T[];
  renderItem: (item: T) => ReactNode;
  renderSelectedItem: (item: T) => ReactNode;
  searchableValue: (item: T) => string;
  placeholder?: string;
  drawerTitle?: string;
  drawerDescription?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  itemLabel?: string;
}

// Single select props
export interface SingleSearchableSelectProps<T> extends SearchableSelectPropsBase<T> {
  isMultiSelect?: false;
  value: T | null;
  onChange: (item: T | null) => void;
}

// Multi select props
export interface MultiSearchableSelectProps<T> extends SearchableSelectPropsBase<T> {
  isMultiSelect: true;
  value: T[];
  onChange: (items: T[]) => void;
}

// Discriminated union
export type SearchableSelectProps<T> =
  | SingleSearchableSelectProps<T>
  | MultiSearchableSelectProps<T>;

// Form field props
interface SearchableSelectFieldPropsBase<
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
  drawerTitle?: string;
  drawerDescription?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  itemLabel?: string;
}

export interface SingleSearchableSelectFieldProps<
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Form extends UseFormReturn<any, any, any>
> extends SearchableSelectFieldPropsBase<T, Form> {
  isMultiSelect?: false;
}

export interface MultiSearchableSelectFieldProps<
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Form extends UseFormReturn<any, any, any>
> extends SearchableSelectFieldPropsBase<T, Form> {
  isMultiSelect: true;
}

export type SearchableSelectFieldProps<
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Form extends UseFormReturn<any, any, any>
> =
  | SingleSearchableSelectFieldProps<T, Form>
  | MultiSearchableSelectFieldProps<T, Form>;

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
  searchPlaceholder?: string;
  emptyLabel?: string;
  itemLabel?: string;
}
