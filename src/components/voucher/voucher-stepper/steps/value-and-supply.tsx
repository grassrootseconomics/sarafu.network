import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InfoAlert, WarningAlert } from "~/components/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { StepControls } from "../controls";
import { useVoucherData, useVoucherForm } from "../provider";

// Unit of Account (ex USD, Eggs) This represents the voucher.
// Value. Ex 1 [name] Voucher is redeemable for 10 [Unit of Account]
// Supply. These are the total number of [name] vouchers you will create digitally. These will be created in your account.

export const valueAndSupplySchema = z.object({
  uoa: z.string(),
  value: z.number(),
  supply: z.number(), // Initial Mint
});
export type FormValues = z.infer<typeof valueAndSupplySchema>;

// This can come from your database or API.
const defaultValues: Partial<FormValues> = {};

export const ValueAndSupplyStep = () => {
  const { values, onValid } = useVoucherForm("valueAndSupply");
  const data = useVoucherData();
  const form = useForm<FormValues>({
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
              value per unit in chosen Unit of Account. Anyone holding these
              CAVs will have a right to redeem them with you. You have an
              obligation for the entire value. This value should not exceed your
              ability to supply the products as per the quantity and frequency
              you specified.
              <br />
              <br />
              <strong>Example</strong>: If you only have a capacity to supply
              $10 USD of your products per month you may not want to create more
              vouchers than that.
            </div>
          }
        />

        <FormField
          control={form.control}
          name="uoa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit of Account</FormLabel>
              <FormControl>
                <Input placeholder="e.g USD" {...field} />
              </FormControl>
              <FormDescription>
                This is how you measure the value of your CAV.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={() => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input
                  placeholder="10"
                  {...form.register("value", {
                    valueAsNumber: true,
                  })}
                />
              </FormControl>
              <FormDescription>
                {`E.g 1 CAV is redeemable for ${value ?? 10} ${
                  uoa ?? "USD"
                } of products`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={() => (
            <FormItem>
              <FormLabel>Supply</FormLabel>
              <FormControl>
                <Input
                  placeholder="1000"
                  {...form.register("supply", {
                    valueAsNumber: true,
                  })}
                />
              </FormControl>
              <FormDescription>
                These are the total number of CAVs you will create digitally.
                These will be created in your account at the end of this process
                after signing.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
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
