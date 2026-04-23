import { type FieldPathByValue, type UseFormReturn } from "react-hook-form";

export type FormValues<T> = T extends UseFormReturn<infer R> ? R : never;

export type FilterNamesByValue<Form extends UseFormReturn, Value> = FieldPathByValue<FormValues<Form>, Value>;
