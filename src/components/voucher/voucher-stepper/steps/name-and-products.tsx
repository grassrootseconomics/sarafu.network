import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { WarningAlert } from "~/components/alert";
import { Button } from "~/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { TokenIndex } from "~/server/token-index";
import { StepControls } from "../controls";
import { useVoucherForm } from "../provider";

const tokenIndex = new TokenIndex();
//(name/description), Quantity and Frequency (per day, week, month, year)
const productSchema = z.object({
  name: z.string().nonempty("Product Name is required"),
  description: z.string().nonempty("Description is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  frequency: z.enum(["day", "week", "month", "year"]),
});

export const nameAndProductsSchema = z.object({
  name: z
    .string()
    .nonempty("Community Asset Voucher (CAV) Name is required")
    .min(3, "CAV Name must be at least 3 characters")
    .max(32, "CAV Name must be at most 32 characters"),
  symbol: z
    .string()
    .nonempty("Symbol is required")
    .min(1, "CAV Symbol must be at least 2 characters")
    .max(6, "CAV Symbol must be at most 6 characters")
    .refine(
      async (value) => {
        try {
          const exists = await tokenIndex.exists(value);
          console.log(exists);
          return !exists;
        } catch (error) {
          console.error(error);
        }
      },
      { message: "Symbol already exists please pick another" }
    ),
  products: z.array(productSchema).optional(),
});
export type FormValues = z.infer<typeof nameAndProductsSchema>;

export const NameAndProductsStep = () => {
  const { values, onValid } = useVoucherForm("nameAndProducts");

  const form = useForm<FormValues>({
    resolver: zodResolver(nameAndProductsSchema),
    mode: "onChange",
    defaultValues: values ?? {
      products: [{ name: "", description: "", quantity: 0, frequency: "day" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: "products",
    control: form.control,
  });
  function onSubmit(data: FormValues) {
    console.log(data);
  }
  return (
    <Form {...form}>
      <form onSubmit={void form.handleSubmit(onSubmit)} className="space-y-8">
        <WarningAlert message="" />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Community Asset Voucher (CAV) Common Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g Weza" {...field} />
              </FormControl>
              <FormDescription>Name used for the CAV</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel>Symbol</FormLabel>
              <FormControl>
                <Input placeholder="e.g WEZA" {...field} />
              </FormControl>
              <FormDescription>
                This is the symbol used for the CAV
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className={cn("flex items-center space-x-2 flex-wrap", {
                "mt-4": index > 0,
              })}
            >
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name={`products.${index}.name` as const}
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      {index === 0 && <FormLabel>Product Name</FormLabel>}
                      <FormControl>
                        <Input placeholder="e.g Weza" {...field} />
                      </FormControl>
                      <FormDescription>
                        Name of product that your voucher is redeemable as
                        payment for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-2">
                <FormField
                  control={form.control}
                  name={`products.${index}.description` as const}
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      {index === 0 && <FormLabel>Description</FormLabel>}
                      <FormControl>
                        <Input placeholder="e.g Fresh Tomatoes" {...field} />
                      </FormControl>
                      <FormDescription>
                        Description of the product
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name={`products.${index}.quantity` as const}
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      {index === 0 && <FormLabel>Quantity</FormLabel>}
                      <FormControl>
                        <Input type="number" placeholder="e.g 1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Quantity of the product that can be redeemed (put zero
                        is not applicable)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name={`products.${index}.frequency` as const}
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      {index === 0 && <FormLabel>Frequency</FormLabel>}
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
                          <SelectItem value="none">Not Applicable</SelectItem>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="">
                <Button
                  className={`${index === 0 ? "mt-8" : "flex items-center"}`}
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => remove(index)}
                >
                  <X />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() =>
              append({
                name: "",
                description: "",
                quantity: 0,
                frequency: "day",
              })
            }
          >
            Add Product
          </Button>
        </div>
        <StepControls
          onNext={form.handleSubmit(onValid, (e) => console.error(e))}
        />
      </form>
    </Form>
  );
};
