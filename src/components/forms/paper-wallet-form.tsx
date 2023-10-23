import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import * as z from "zod";

import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { InputField } from "./fields/input-field";

const FormSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm Password is required" }),
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
export const PaperWalletForm = (props: PaperWalletFormProps) => {
  const form = useForm<FormTypes>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: defaultValues,
  });

  const handleSubmit = (data: FormTypes) => {
    props.onSubmit(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <InputField
          form={form}
          name="password"
          placeholder="Password"
          label="Password"
        />
        <InputField
          form={form}
          name="confirmPassword"
          placeholder="Confirm Password"
          label="Confirm Password"
        />
        <Button type="submit">Generate</Button>
      </form>
    </Form>
  );
};
