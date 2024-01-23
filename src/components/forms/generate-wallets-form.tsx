import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import * as z from "zod";

import QRCard from "../paper/qr-card";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { ImageInputField } from "./fields/image-field";
import { InputField } from "./fields/input-field";

const FormSchema = z.object({
  title: z.string(),
  logo: z.string(),
  custom_text: z.string(),
  website: z.string(),
  amount: z.coerce.number().positive().min(1),
});

export type GenerateWalletsFormTypes = z.infer<typeof FormSchema>;

const defaultValues: Partial<GenerateWalletsFormTypes> = {
  title: "Sarafu Network",
  website: "https://sarafu.network",
  logo: "/logo.svg",
  amount: 1,
  custom_text: "",
};

interface GenerateWalletsFormProps {
  onSubmit: (data: GenerateWalletsFormTypes) => void;
}
export const GenerateWalletsForm = (props: GenerateWalletsFormProps) => {
  const form = useForm<GenerateWalletsFormTypes>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: defaultValues,
  });

  const handleSubmit = (data: GenerateWalletsFormTypes) => {
    props.onSubmit(data);
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 space-y-8"
      >
        <div className="">
          <InputField
            form={form}
            name="title"
            placeholder="Title"
            label="Title"
          />
          <InputField
            form={form}
            name="amount"
            type="number"
            placeholder="Amount"
            label="Amount"
          />
          <InputField
            form={form}
            name="website"
            placeholder="Website"
            label="Website"
          />
          <ImageInputField form={form} name="logo" label="Logo" />
          <InputField
            form={form}
            name="custom_text"
            placeholder="Custom Text"
            label="Custom Text"
          />
        </div>
        <div className="flex flex-col items-center">
          {/* Preview */}
          <h3 className="text-xl font-bold">Preview</h3>
          <QRCard
            title={form.watch("title")}
            custom_text={form.watch("custom_text")}
            logo={form.watch("logo")}
            website={form.watch("website")}
            account={{
              address: "0xeBd05Bd7e73004022b3a5003154027a31ca4Aad9",
              privateKey: "0x0",
            }}
          />
        </div>
        <Button className="col-span-2" type="submit">
          Generate
        </Button>
      </form>
    </Form>
  );
};
