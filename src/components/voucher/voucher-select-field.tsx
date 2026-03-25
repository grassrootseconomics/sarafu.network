"use client";

import { type ReactNode } from "react";
import { type FieldPath, type UseFormReturn } from "react-hook-form";
import {
  SearchableSelectField,
  type FormValues,
} from "~/components/forms/fields/searchable-select";
import { VoucherChip } from "./voucher-chip";

// Covers the two common tRPC data shapes for vouchers
interface StandardVoucherItem {
  voucher_address: string;
  voucher_name: string;
  symbol: string;
}

interface AddressVoucherItem {
  address: `0x${string}`;
  name: string;
  symbol: string;
}

export type VoucherItem = StandardVoucherItem | AddressVoucherItem;

function getVoucherAddress(item: VoucherItem): `0x${string}` {
  return ("voucher_address" in item
    ? item.voucher_address
    : item.address) as `0x${string}`;
}

function getVoucherName(item: VoucherItem): string {
  return "voucher_name" in item ? item.voucher_name : item.name;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface VoucherSelectFieldProps<T extends VoucherItem, Form extends UseFormReturn<any, any, any>> {
  form: Form;
  name: FieldPath<FormValues<Form>>;
  items: T[];
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  isMultiSelect?: boolean;
  renderItem?: (item: T) => ReactNode;
  renderSelectedItem?: (item: T) => ReactNode;
  searchableValue?: (item: T) => string;
  getFormValue?: (item: T) => unknown;
  getSelectedValue?: (value: unknown) => unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function VoucherSelectField<T extends VoucherItem, Form extends UseFormReturn<any, any, any>>(
  props: VoucherSelectFieldProps<T, Form>
) {
  const defaultRender = (item: T) => (
    <VoucherChip voucher_address={getVoucherAddress(item)} />
  );

  if (props.isMultiSelect) {
    return (
      <SearchableSelectField
        form={props.form}
        name={props.name}
        items={props.items}
        isMultiSelect={true}
        label={props.label}
        placeholder={props.placeholder}
        description={props.description}
        disabled={props.disabled}
        className={props.className}
        getFormValue={props.getFormValue ?? getVoucherAddress}
        getSelectedValue={props.getSelectedValue}
        searchableValue={props.searchableValue ?? ((item: T) => `${item.symbol} ${getVoucherName(item)}`)}
        renderItem={props.renderItem ?? defaultRender}
        renderSelectedItem={props.renderSelectedItem ?? defaultRender}
        drawerTitle="Select Voucher"
        drawerDescription="Choose from available vouchers"
        searchPlaceholder="Search vouchers..."
        emptyLabel="No vouchers available"
        itemLabel="voucher"
      />
    );
  }

  return (
    <SearchableSelectField
      form={props.form}
      name={props.name}
      items={props.items}
      label={props.label}
      placeholder={props.placeholder}
      description={props.description}
      disabled={props.disabled}
      className={props.className}
      getFormValue={props.getFormValue ?? getVoucherAddress}
      getSelectedValue={props.getSelectedValue}
      searchableValue={props.searchableValue ?? ((item: T) => `${item.symbol} ${getVoucherName(item)}`)}
      renderItem={props.renderItem ?? defaultRender}
      renderSelectedItem={props.renderSelectedItem ?? defaultRender}
      drawerTitle="Select Voucher"
      drawerDescription="Choose from available vouchers"
      searchPlaceholder="Search vouchers..."
      emptyLabel="No vouchers available"
      itemLabel="voucher"
    />
  );
}
