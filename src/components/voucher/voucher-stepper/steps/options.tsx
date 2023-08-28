import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { StepControls } from "../controls";
import { useVoucherForm } from "../provider";

// Cap: Would you ever like to mint more of these vouchers?
// Yes (highly recommended)
// Seal:
// Would you like to transfer ownership of your voucher to someone else
// Yes -> please specify the address.
// Capacity:  What is the maximum capacity of products you can redeem for your vouchers over a time period?
// Period: (Daily)
// Max: (num vouchers)
// I.e. I can only redeem a maximum of 20 vouchers daily.

export const optionsSchema = z
  .object({
    hasCap: z.enum(["yes", "no"]),
    cap: z.number().positive("Capacity must be positive"),
    transfer: z.enum(["yes", "no"]),
    transferAddress: z.string(),
    maxCapacityAcceptedDaily: z.number().positive("Capacity must be positive"),
  })
  .refine((data) => data.transfer === "no" || isAddress(data.transferAddress), {
    message: "Invalid address",
    path: ["transferAddress"],
  });
export type FormValues = z.infer<typeof optionsSchema>;

// This can come from your database or API.
const defaultValues: Partial<FormValues> = {};

export const OptionsStep = () => {
  const { values, onValid } = useVoucherForm("options");

  const form = useForm<FormValues>({
    resolver: zodResolver(optionsSchema),
    mode: "onChange",
    defaultValues: values ?? defaultValues,
  });

  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="hasCap"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>
                Would you ever like to mint more of these vouchers?
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="yes" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Type */}
        {form.watch("hasCap") === "yes" && (
          <FormField
            control={form.control}
            name="cap"
            render={({}) => (
              <FormItem className="space-y-3">
                <FormLabel>
                  What is the maximum capacity of products you can redeem for
                  your vouchers over a time period?
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="10"
                    {...form.register("cap", {
                      valueAsNumber: true,
                    })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="transfer"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>
                Would you like to transfer ownership of your voucher to someone
                else?
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="yes" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Type */}
        {form.watch("transfer") === "yes" && (
          <FormField
            control={form.control}
            name="transferAddress"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Please specify the address.</FormLabel>
                <FormControl className="flex flex-col space-y-1">
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Input placeholder="0x..." {...field} />
                    </FormControl>
                  </FormItem>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="maxCapacityAcceptedDaily"
          render={({}) => (
            <FormItem className="space-y-3">
              <FormLabel>
                What is the maximum capacity of products you can redeem for your
                vouchers over a time period?
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="10"
                  {...form.register("maxCapacityAcceptedDaily", {
                    valueAsNumber: true,
                  })}
                />
              </FormControl>
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
