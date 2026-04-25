import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import * as z from "zod";

import QRCard from "../paper/qr-card";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { InputField } from "./fields/input-field";
import {
  PaperWalletCustomizationFields,
  PaperWalletCustomizationSchema,
  paperWalletCustomizationDefaultValues,
} from "./paper-wallet-customization-fields";

const FormSchema = PaperWalletCustomizationSchema.extend({
  amount: z.coerce.number().positive().min(1),
});

export type GenerateWalletsFormTypes = z.infer<typeof FormSchema>;

const defaultValues: Partial<GenerateWalletsFormTypes> = {
  ...paperWalletCustomizationDefaultValues,
  amount: 1,
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
  const [title, customText, logo, website] = useWatch({
    control: form.control,
    name: ["title", "custom_text", "logo", "website"],
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
          <PaperWalletCustomizationFields
            form={form}
            afterTitle={
              <InputField
                form={form}
                name="amount"
                type="number"
                placeholder="Amount"
                label="Amount"
              />
            }
          />
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold">Preview</h3>
          <QRCard
            title={title}
            custom_text={customText}
            logo={logo}
            website={website}
            account={{
              address: "0xeBd05Bd7e73004022b3a5003154027a31ca4Aad9",
              privateKey: "0x0",
            }}
          />
        </div>
        <Button className="col-span-1 md:col-span-2" type="submit">
          Generate
        </Button>
      </form>
    </Form>
  );
};
