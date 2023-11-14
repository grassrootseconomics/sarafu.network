import { type UseFormReturn } from "react-hook-form";

export type FormValues<T> = T extends UseFormReturn<infer R> ? R : never;

