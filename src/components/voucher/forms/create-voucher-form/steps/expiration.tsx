import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DateField } from "~/components/forms/fields/date-field";
import { InputField } from "~/components/forms/fields/input-field";
import { RadioField } from "~/components/forms/fields/radio-field";
import { SelectField } from "~/components/forms/fields/select-field";
import { Form } from "~/components/ui/form";
import { StepControls } from "../controls";
import { useVoucherForm } from "../provider";
import {
  expirationSchema,
  expirationTypeEnum,
  type ExpirationFormValues,
} from "../schemas/expiration";

// This can come from your database or API.
const defaultValues = {
  type: expirationTypeEnum.enum.gradual,
  rate: 2,
  period: 43200,
};

export const redistributionPeriods = [
  { label: "1 Week", value: 10080 },
  { label: "1 Month", value: 43200 },
  { label: "6 Months", value: 259200 },
  { label: "1 Year", value: 518400 },
];
export const ExpirationStep = () => {
  const { values, onValid } = useVoucherForm("expiration");

  const form = useForm<ExpirationFormValues>({
    resolver: zodResolver(expirationSchema),
    mode: "onChange",
    defaultValues: values ?? defaultValues,
  });

  const type = form.watch("type");
  return (
    <Form {...form}>
      <form className="space-y-8">
        <RadioField
          form={form}
          name="type"
          label="Should your voucher expire?"
          items={[
            { label: "Gradually (recommended)", value: "gradual" },
            { label: "On a Specific Date", value: "date" },
            { label: "Both", value: "both" },
            { label: "None (Not recommended)", value: "none" },
          ]}
          disabled={true}
        />

        {/* Demurrage */}
        {["gradual", "both"].includes(type) && (
          <>
            <InputField
              form={form}
              name="rate"
              label="Expiration (Demurrage) Rate (%)"
              placeholder="Demurrage Rate (%)"
              description="This is the rate at which the voucher will expire per redistribution period. E.g. 2% per month means that the number of CAVs in any account will reduce by 2% in total over the redistribution period. (This will happen continuously). i.e. If someone holds 100 CAVs they will only be holding 98 by the end of the month and 2 CAVs will be added to the Community Fund."
            />
            <SelectField
              form={form}
              name="period"
              label="Redistribution Period"
              placeholder="Redistribution Period"
              description="This is the period after which the voucher will be redistributed to the community fund."
              items={redistributionPeriods}
            />
            <InputField
              form={form}
              name="communityFund"
              label="Community Fund Address"
              placeholder="0x..."
              description="This is the address where expired vouchers will be sent to after each redistribution period. This might be your CELO blockchain address or that of your association. Note that distribution of expired vouchers can be a wonderful participatory community process."
            />
          </>
        )}
        {["both", "date"].includes(type) && (
          <DateField
            form={form}
            name="expirationDate"
            label="Expiration Date"
            placeholder="Expiration Date"
            description="The date at which the voucher will no longer be usable"
          />
        )}
        <StepControls
          onNext={form.handleSubmit(onValid, (e) => console.error(e))}
        />
      </form>
    </Form>
  );
};
