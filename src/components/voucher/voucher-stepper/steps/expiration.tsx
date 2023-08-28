import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { cn } from "~/lib/utils";
import { StepControls } from "../controls";
import { useVoucherForm } from "../provider";

// Does your Voucher Expire:
// Yes (highly recommended)

// If yes:
// :
// Does it expire gradually (recommended) (demurrage)?
// At what rate does the voucher expire?
// Rate (%)
// Time period
// 	Where do expired vouchers go? (maintaining a stable supply)
// Community Fund address (default the issuer)
// Does it expire on a particular date?
// What is the date?
const typeEnum = z.enum(["none", "date", "gradual", "both"]);
const noExpirySchema = z.object({
  type: z.literal(typeEnum.enum.none),
});
const dateExpirySchema = z.object({
  type: z.literal(typeEnum.enum.date),
  expirationData: z.date(),
});
const gradualExpirySchema = z.object({
  type: z.literal(typeEnum.enum.gradual),
  rate: z
    .number()
    .positive("Demurrage Rate must be positive")
    .refine((value) => !isNaN(value), {
      message: "Demurrage Rate must be a number",
    }),
  period: z.coerce
    .number()
    .positive("Period Minutes must be a positive integer")
    .int("Period Minutes must be a positive integer")
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: "Period Minutes must be a positive integer",
    }),
  communityFund: z
    .string()
    .nonempty("Default Sink Address is required")
    .refine(isAddress, { message: "Invalid address format" }),
});
const bothExpirySchema = z.object({
  type: z.literal(typeEnum.enum.both),
  expirationData: z.date(),
  rate: z
    .number()
    .positive("Demurrage Rate must be positive")
    .refine((value) => !isNaN(value), {
      message: "Demurrage Rate must be a number",
    }),
  period: z.coerce
    .number()
    .positive("Period Minutes must be a positive integer")
    .int("Period Minutes must be a positive integer")
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: "Period Minutes must be a positive integer",
    }),
  communityFund: z
    .string()
    .nonempty("Default Sink Address is required")
    .refine(isAddress, { message: "Invalid address format" }),
});
export const expirationSchema = z.discriminatedUnion("type", [
  noExpirySchema,
  dateExpirySchema,
  gradualExpirySchema,
  bothExpirySchema,
]);

export type FormValues = z.infer<typeof expirationSchema>;

// This can come from your database or API.
const defaultValues = {
  type: typeEnum.enum.none,
};

export const ExpirationStep = () => {
  const { values, onValid } = useVoucherForm("expiration");

  const form = useForm<FormValues>({
    resolver: zodResolver(expirationSchema),
    mode: "onChange",
    defaultValues: values ?? defaultValues,
  });
  function onSubmit(data: FormValues) {
    console.log(data);
  }
  const type = form.watch("type");
  return (
    <Form {...form}>
      <form onSubmit={void form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Type */}

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Should your voucher expire?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="none" />
                    </FormControl>
                    <FormLabel className="font-normal">None</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="date" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      On a Specific Date
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="gradual" />
                    </FormControl>
                    <FormLabel className="font-normal">Gradually</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="both" />
                    </FormControl>
                    <FormLabel className="font-normal">Both</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Demurrage */}
        {["gradual", "both"].includes(type) && (
          <>
            <FormField
              control={form.control}
              name="rate"
              render={() => (
                <FormItem className="space-y-0">
                  <FormLabel>Demurrage Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Demurrage Rate (%)"
                      {...form.register("rate", {
                        valueAsNumber: true,
                        value: 2,
                      })}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    This is the rate at which the voucher will expire. E.g. 2%
                    means that the voucher will lose 2% of its value every
                    period.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period Minutes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Period Minutes"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    This is the period in minutes after which the voucher will
                    be redistributed to the community fund.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="communityFund"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormLabel>Community Fund Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0x00..00" {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    This is the address where expired vouchers will be sent to.
                  </FormDescription>
                </FormItem>
              )}
            />
          </>
        )}
        {["both", "date"].includes(type) && (
          <FormField
            control={form.control}
            name="expirationData"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>When should the voucher expire?</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  The date at which the voucher will no longer be usable
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <StepControls
          onNext={form.handleSubmit(onValid, (e) => console.error(e))}
        />
      </form>
    </Form>
  );
};
