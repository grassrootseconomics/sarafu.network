"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { DateField } from "~/components/forms/fields/date-field";
import { InputField } from "~/components/forms/fields/input-field";
import { RadioField } from "~/components/forms/fields/radio-field";
import { SelectField } from "~/components/forms/fields/select-field";
import { Button } from "~/components/ui/button";
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
  { label: "1 Week", value: "10080" },
  { label: "1 Month", value: "43200" },
  { label: "6 Months", value: "259200" },
  { label: "1 Year", value: "518400" },
];
export const ExpirationStep = () => {
  const { values, onValid } = useVoucherForm("expiration");

  const form = useForm<ExpirationFormValues>({
    resolver: zodResolver(expirationSchema),
    mode: "onChange",
    defaultValues: values ?? defaultValues,
  });

  const type = form.watch("type");
  const account = useAccount();
  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <RadioField
            form={form}
            name="type"
            label="Should your voucher expire?"
            items={[
              { label: "Gradually", value: "gradual" },
              { label: "None", value: "none" },
            ]}
            disabled={false}
          />
        </div>

        {["gradual", "both"].includes(type) && (
          <div className="space-y-6">
            <InputField
              form={form}
              name="rate"
              label="Expiration (Demurrage) Rate (%)"
              placeholder="Demurrage Rate (%)"
              description="This is the rate at which the voucher will expire per redistribution period."
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
              description="This is the address where expired vouchers will be sent to after each redistribution period."
              endAdornment={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    if (account && account.address) {
                      form.setValue("communityFund", account.address);
                    }
                  }}
                >
                  Use My Address
                </Button>
              }
            />
          </div>
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
