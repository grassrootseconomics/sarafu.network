import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { StepControls } from "../controls";
import { useVoucherForm } from "../provider";
import {
  ExpirationFormValues,
  expirationSchema,
  expirationTypeEnum,
} from "../schemas/expiration";

// This can come from your database or API.
const defaultValues = {
  type: expirationTypeEnum.enum.gradual,
  rate: 2,
  period: 43200,
};

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
                      <RadioGroupItem value="gradual" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Gradually (recommended)
                    </FormLabel>
                  </FormItem>

                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem disabled value="date" />
                    </FormControl>
                    <FormLabel className="opacity-20 font-normal">
                      On a Specific Date
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem disabled value="both" />
                    </FormControl>
                    <FormLabel className="opacity-20 font-normal">
                      Both
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem disabled value="none" />
                    </FormControl>
                    <FormLabel className="opacity-20 font-normal">
                      None <i>(Not recommended)</i>
                    </FormLabel>
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
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormLabel>Expiration (Demurrage) Rate (%)</FormLabel>
                  <FormControl>
                    <Input placeholder="Demurrage Rate (%)" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the rate at which the voucher will expire per
                    redistribution period. E.g. 2% per month means that the
                    number of CAVs in any account will reduce by 2% in total
                    over the redistribution period. (This will happen
                    continuously). i.e. If someone holds 100 CAVs they will only
                    be holding 98 by the end of the month and 2 CAVs will be
                    added to the Community Fund.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Redistribution Period</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="10080">1 Week</SelectItem>
                      <SelectItem value="43200">1 Month</SelectItem>
                      <SelectItem value="259200">6 Months</SelectItem>
                      <SelectItem value="518400">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This is the period after which the voucher will be
                    redistributed to the community fund.
                  </FormDescription>
                  <FormMessage />
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
                  <FormDescription>
                    This is the address where expired vouchers will be sent to
                    after each redistribution period. This might be your CELO
                    blockchain address or that of your association. Note that
                    distribution of expired vouchers can be a wonderful
                    participatory community process.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        {["both", "date"].includes(type) && (
          <FormField
            control={form.control}
            name="expirationDate"
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
