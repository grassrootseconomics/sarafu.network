import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import * as z from "zod";

import { EyeOpenIcon } from "@radix-ui/react-icons";
import React from "react";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { InputField } from "./fields/input-field";

const FormSchema = z
  .object({
    password: z
      .string()
      .min(4, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(4, { message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password don't match",
  });

type FormTypes = z.infer<typeof FormSchema>;

const defaultValues: Partial<FormTypes> = {
  password: "",
  confirmPassword: "",
};

interface PaperWalletFormProps {
  onSubmit: (data: FormTypes) => void;
}
export const EncryptedPaperWalletForm = (props: PaperWalletFormProps) => {
  const form = useForm<FormTypes>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: defaultValues,
  });
  const [showPassword, setShowPassword] = React.useState<[boolean, boolean]>([
    false,
    false,
  ]);
  const handleSubmit = (data: FormTypes) => {
    props.onSubmit(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="text-base  text-gray-500">
          Enter a password to encrypt your private key
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
              {showPassword[0] ? <EyeOpenIcon /> : <EyeOpenIcon />}
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
              {showPassword[1] ? <EyeOpenIcon /> : <EyeOpenIcon />}
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
