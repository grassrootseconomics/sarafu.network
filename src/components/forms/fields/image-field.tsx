/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { type FieldPath, type UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { type FormValues } from "./type-helper";

interface ImageInputFieldProps<Form extends UseFormReturn> {
  form: Form;
  name: FieldPath<FormValues<Form>>;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function ImageInputField<Form extends UseFormReturn<any>>(
  props: ImageInputFieldProps<Form>
) {
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        // @ts-ignore
        props.form.setValue(props.name, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setImagePreview(url);
    props.form.setValue(props.name as string, url);
  };

  return (
    <FormField
      control={props.form.control}
      name={props.name as string}
      render={({ field }) => (
        <FormItem className={props.className}>
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <FormControl>
            <div className="flex flex-col sm:flex-row gap-2 justify-evenly ">
              <div className="flex flex-col gap-2 items-center justify-evenly">
                <Input
                  type="file"
                  accept="image/*"
                  disabled={props.disabled}
                  onChange={handleFileChange}
                  placeholder={props.placeholder}
                />
                <Input
                  type="text"
                  disabled={props.disabled}
                  {...field}
                  value={(field.value as string) ?? ""}
                  placeholder={props.placeholder}
                  onChange={handleUrlChange}
                />
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "100px" }}
                />
              )}
            </div>
          </FormControl>
          {props.description && (
            <FormDescription>{props.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
