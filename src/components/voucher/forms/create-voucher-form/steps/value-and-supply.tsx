import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InfoAlert, WarningAlert } from "~/components/alert";
import { InputField } from "~/components/forms/fields/input-field";
import { Form } from "~/components/ui/form";
import { StepControls } from "../controls";
import { useVoucherData, useVoucherForm } from "../provider";
import {
  valueAndSupplySchema,
  type ValueAndSupplyFormValues,
} from "../schemas/value-and-supply";

// This can come from your database or API.
const defaultValues: Partial<ValueAndSupplyFormValues> = {};

export const ValueAndSupplyStep = () => {
  const { values, onValid } = useVoucherForm("valueAndSupply");
  const data = useVoucherData();
  const form = useForm<ValueAndSupplyFormValues>({
    resolver: zodResolver(valueAndSupplySchema),
    mode: "onChange",
    defaultValues: values ?? defaultValues,
  });

  const uoa = form.watch("uoa");
  const value = form.watch("value");
  const supply = form.watch("supply");

  return (
    <Form {...form}>
      <form className="space-y-8">
        <WarningAlert
          message={
            <div>
              Note the total value of your CAVs is your supply multiplied by
              value per unit in chosen Unit of Account. You are giving anyone
              holding these CAVs a right to redeem them with you. This total
              value should not exceed your ability to supply the products as per
              the quantity and frequency you specified.
              <br />
              <br />
              <strong>Example</strong>: If you only have a capacity to supply
              $10 USD of your products per month you may not want to create more
              vouchers than that! Start with only the amount you need.
            </div>
          }
        />
        <InputField
          form={form}
          name="uoa"
          label="Unit of Account"
          placeholder="e.g USD"
          description="This is how you measure the value of your CAV."
        />
        <InputField
          form={form}
          name="value"
          label="Value per unit"
          placeholder="e.g 10"
          description={`E.g 1 CAV is redeemable for ${value ?? 10} ${
            uoa ?? "USD"
          } of products`}
        />
        <InputField
          form={form}
          name="supply"
          label="Supply"
          placeholder="e.g 1000"
          description="Total number of CAVs you will create digitally. These will be created in your account at the end of this process
          after signing."
        />
        <InfoAlert
          message={`You are going to create ${supply} ${
            data.nameAndProducts?.symbol
          } - valued at ${
            supply * value
          } ${uoa}, redeemable as payment for your products`}
        />
        <StepControls
          onNext={form.handleSubmit(onValid, (e) => console.error(e))}
        />
      </form>
    </Form>
  );
};
