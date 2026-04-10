/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { type FieldPath, type UseFormReturn } from "react-hook-form";
import ImageCrop from "~/components/file-uploader/image-crop";
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
  circularCrop?: boolean;
}

export function ImageInputField<Form extends UseFormReturn<any>>(
  props: ImageInputFieldProps<Form>
) {
  const [imagePreview, setImagePreview] = useState<string>("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const applyImage = (dataUrl: string) => {
    setImagePreview(dataUrl);
    // @ts-ignore
    props.form.setValue(props.name, dataUrl);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (props.circularCrop) {
          setCropSrc(result);
        } else {
          applyImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (blob: Blob) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      applyImage(e.target?.result as string);
    };
    reader.readAsDataURL(blob);
    setCropSrc(null);
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setImagePreview(url);
    props.form.setValue(props.name as string, url);
  };

  return (
    <>
      {cropSrc && (
        <ImageCrop
          image={cropSrc}
          circularCrop
          aspectRatio={1}
          onComplete={handleCropComplete}
          onCancel={() => setCropSrc(null)}
        />
      )}
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
                  // eslint-disable-next-line @next/next/no-img-element
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
    </>
  );
}
