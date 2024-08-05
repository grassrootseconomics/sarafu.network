/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FieldPath, type UseFormReturn } from "react-hook-form";
import ImageUploadComponent from "~/components/file-uploader/image-upload";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { type FormValues } from "./type-helper";

interface ImageUploadFieldProps<Form extends UseFormReturn> {
  form: Form;
  name: FieldPath<FormValues<Form>>;
  folder: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
  aspectRatio?: number;
  circularCrop?: boolean;
}

export function ImageUploadField<Form extends UseFormReturn<any>>(
  props: ImageUploadFieldProps<Form>
) {
  return (
    <FormField
      control={props.form.control}
      name={props.name as string}
      render={({ field }) => (
        <FormItem className={props.className}>
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <FormControl>
            <div className="max-w-[300px] mx-auto">
              <ImageUploadComponent
                onUpload={(url) => field.onChange(url)}
                value={field.value as string | null}
                folder={props.folder}
                aspectRatio={props.aspectRatio}
                circularCrop={props.circularCrop}
              />
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
