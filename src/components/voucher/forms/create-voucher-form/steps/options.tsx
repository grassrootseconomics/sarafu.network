import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField } from "~/components/forms/fields/input-field";
import { RadioField } from "~/components/forms/fields/radio-field";
import { Form } from "~/components/ui/form";
import { StepControls } from "../controls";
import { useVoucherForm } from "../provider";
import { optionsSchema, type OptionsFormValues } from "../schemas/options";

// This can come from your database or API.
const defaultValues: Partial<OptionsFormValues> = {
  transfer: "no",
};

export const OptionsStep = () => {
  const { values, onValid } = useVoucherForm("options");

  const form = useForm<OptionsFormValues>({
    resolver: zodResolver(optionsSchema),
    mode: "onChange",
    defaultValues: values ?? defaultValues,
  });
  return (
    <Form {...form}>
      <form className="space-y-8">
        <RadioField
          form={form}
          name="transfer"
          disabled={true}
          label="Would you like to transfer ownership of your voucher to someone else?"
          items={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ]}
        />

        {form.watch("transfer") === "yes" && (
          <InputField
            form={form}
            name="transferAddress"
            placeholder="0x..."
            label="Please specify the address. (Note they will have full control over your CAV)"
          />
        )}

        <StepControls
          onNext={form.handleSubmit(onValid, (e) => console.error(e))}
        />
      </form>
    </Form>
  );
};
