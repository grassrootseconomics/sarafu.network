import {
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { type ReactNode } from "react";
import * as z from "zod";

import { ImageInputField } from "./fields/image-field";
import { InputField } from "./fields/input-field";

export const PaperWalletCustomizationSchema = z.object({
  title: z.string(),
  logo: z.string(),
  custom_text: z.string(),
  website: z.string(),
});

export type PaperWalletCustomizationFormTypes = z.infer<
  typeof PaperWalletCustomizationSchema
>;

export const paperWalletCustomizationDefaultValues: PaperWalletCustomizationFormTypes =
  {
    title: "Sarafu Network",
    website: "https://sarafu.network",
    logo: "/logo.svg",
    custom_text: "",
  };

type CustomizablePaperWalletForm = FieldValues &
  PaperWalletCustomizationFormTypes;

interface PaperWalletCustomizationFieldsProps<
  FormValues extends CustomizablePaperWalletForm,
> {
  form: UseFormReturn<FormValues>;
  afterTitle?: ReactNode;
}

const customizationField = <FormValues extends CustomizablePaperWalletForm>(
  name: keyof PaperWalletCustomizationFormTypes
) => name as FieldPath<FormValues>;

export function PaperWalletCustomizationFields<
  FormValues extends CustomizablePaperWalletForm,
>(props: PaperWalletCustomizationFieldsProps<FormValues>) {
  return (
    <>
      <InputField
        form={props.form}
        name={customizationField<FormValues>("title")}
        placeholder="Title / Name"
        label="Title / Name"
      />
      {props.afterTitle}
      <InputField
        form={props.form}
        name={customizationField<FormValues>("website")}
        placeholder="Website"
        label="Website"
      />
      <ImageInputField
        form={props.form}
        name={customizationField<FormValues>("logo")}
        label="Logo / Picture"
        circularCrop
      />
      <InputField
        form={props.form}
        name={customizationField<FormValues>("custom_text")}
        placeholder="Custom Text"
        label="Custom Text"
      />
    </>
  );
}
