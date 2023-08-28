import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useVoucherForm } from "../provider";

// Unit of Account (ex USD, Eggs) This represents the value of your voucher.
// Value. Ex 1 [name] Voucher is redeemable for 10 [Unit of Account]
// Supply. These are the total number of [name] vouchers you will create digitally. These will be created in your account.

export const valueAndSupplySchema = z.object({
  uoa: z.string(),
  value: z.number(),
  supply: z.number(),
});
export type FormValues = z.infer<typeof valueAndSupplySchema>;

// This can come from your database or API.
const defaultValues: Partial<FormValues> = {};

export const ValueAndSupplyStep = () => {
  const { values, onValid } = useVoucherForm("valueAndSupply");

  const form = useForm<FormValues>({
    resolver: zodResolver(valueAndSupplySchema),
    mode: "onChange",
    defaultValues: values ?? defaultValues,
  });

  const uoa = form.watch("uoa");
  const value = form.watch("value");

  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="uoa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit of Account</FormLabel>
              <FormControl>
                <Input placeholder="EGGS" {...field} />
              </FormControl>
              <FormDescription>
                This represents the value of your voucher.
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
                {`E.g 1 Voucher is redeemable for ${value ?? 10} ${
                  uoa ?? "EGGS"
                }`}
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
                These are the total number of vouchers you will create
                digitally. These will be created in your account.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <StepControls
          onNext={form.handleSubmit(onValid, (e) => console.error(e))}
        />
      </form>
    </Form>
  );
};
