import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import * as z from "zod";

import { EyeOpenIcon } from "@radix-ui/react-icons";
import React from "react";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { InputField } from "./fields/input-field";

function createFormSchema(t: (key: string) => string) {
  return z
    .object({
      password: z
        .string()
        .min(4, { message: t("validation.passwordMinLength") }),
      confirmPassword: z
        .string()
        .min(4, { message: t("validation.confirmPasswordRequired") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: t("validation.passwordsDontMatch"),
    });
}

type FormTypes = {
  password: string;
  confirmPassword: string;
};

interface PaperWalletFormProps {
  onSubmit: (data: FormTypes) => void;
}
export const EncryptedPaperWalletForm = (props: PaperWalletFormProps) => {
  const t = useTranslations("forms");
  const tButtons = useTranslations("buttons");
  const FormSchema = createFormSchema(t);

  const defaultValues: Partial<FormTypes> = {
    password: "",
    confirmPassword: "",
  };

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
          {t("passwordInstructions")}
        </div>
        <InputField
          form={form}
          name="password"
          placeholder={t("password")}
          label={t("password")}
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
          placeholder={t("confirmPassword")}
          label={t("confirmPassword")}
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
          <Button type="submit">{tButtons("create")}</Button>
        </div>
      </form>
    </Form>
  );
};
