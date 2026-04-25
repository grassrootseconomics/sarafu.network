import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import * as z from "zod";

import { Eye } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { InputField } from "./fields/input-field";
import {
  PaperWalletCustomizationFields,
  type PaperWalletCustomizationFormTypes,
  PaperWalletCustomizationSchema,
  paperWalletCustomizationDefaultValues,
} from "./paper-wallet-customization-fields";

const FormSchema = PaperWalletCustomizationSchema.extend({
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z
    .string()
    .min(6, { message: "Confirm Password must be at least 6 characters" }),
})
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password don't match",
  });

export type EncryptedPaperWalletFormTypes = z.infer<typeof FormSchema>;

const defaultValues: Partial<EncryptedPaperWalletFormTypes> = {
  ...paperWalletCustomizationDefaultValues,
  password: "",
  confirmPassword: "",
};

interface PaperWalletFormProps {
  onSubmit: (data: EncryptedPaperWalletFormTypes) => void;
}
export const EncryptedPaperWalletForm = (props: PaperWalletFormProps) => {
  const form = useForm<EncryptedPaperWalletFormTypes>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: defaultValues,
  });
  const [showPassword, setShowPassword] = React.useState<[boolean, boolean]>([
    false,
    false,
  ]);
  const handleSubmit = (data: EncryptedPaperWalletFormTypes) => {
    props.onSubmit(data);
    form.reset();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <PaperWalletCustomizationFields form={form} />
        <div className="text-base  text-gray-500">
          Enter a password to encrypt your Wallet (At least 6 characters)
        </div>
        <InputField
          form={form}
          name="password"
          placeholder="Password"
          label="Password"
          type={showPassword[0] ? "text" : "password"}
          endAdornment={
            <Button
              variant="ghost"
              type="button"
              tabIndex={-1}
              onClick={() => {
                setShowPassword((sp) => [!sp[0], sp[1]]);
              }}
            >
              {showPassword[0] ? <Eye /> : <Eye />}
            </Button>
          }
        />
        <InputField
          form={form}
          name="confirmPassword"
          placeholder="Confirm Password"
          label="Confirm Password"
          type={showPassword[1] ? "text" : "password"}
          endAdornment={
            <Button
              variant="ghost"
              type="button"
              tabIndex={-1}
              onClick={() => {
                setShowPassword((sp) => [sp[0], !sp[1]]);
              }}
            >
              {showPassword[1] ? <Eye /> : <Eye />}
            </Button>
          }
        />
        <div className="flex justify-center">
          <Button type="submit">Create</Button>
        </div>
      </form>
    </Form>
  );
};

interface UnencryptedPaperWalletFormProps {
  onSubmit: (data: PaperWalletCustomizationFormTypes) => void;
}

export const UnencryptedPaperWalletForm = (
  props: UnencryptedPaperWalletFormProps
) => {
  const form = useForm<PaperWalletCustomizationFormTypes>({
    resolver: zodResolver(PaperWalletCustomizationSchema),
    mode: "onBlur",
    defaultValues: paperWalletCustomizationDefaultValues,
  });

  const handleSubmit = (data: PaperWalletCustomizationFormTypes) => {
    props.onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <PaperWalletCustomizationFields form={form} />
        <div className="flex justify-center">
          <Button type="submit">Create</Button>
        </div>
      </form>
    </Form>
  );
};
