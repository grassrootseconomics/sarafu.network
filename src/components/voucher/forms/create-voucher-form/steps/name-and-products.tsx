import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { StepControls } from "../controls";
import { useVoucherForm } from "../provider";
import {
  NameAndProductsFormValues,
  nameAndProductsSchema,
} from "../schemas/name-and-products";

//(name/description), Quantity and Frequency (per day, week, month, year)

export const NameAndProductsStep = () => {
  const { values, onValid } = useVoucherForm("nameAndProducts");

  const form = useForm<NameAndProductsFormValues>({
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

  return (
    <Form {...form}>
      <form className="space-y-8">
        <WarningAlert
          message={
            <>
              <p>
                Here you will name your Community Asset Voucher (CAV) and also
                specify what products it is redeemable as payment for as well as
                your capacity to provide those over time. Ensure that these
                products are avalible! If you are giving this CAV as a gift
                certificate and someone returns it to you as the issuer - you
                must redeem it as payment. Note the value of the CAV (i.e. 1 CAV
                = $1 USD of your products) - will be determined in the next
                section.{" "}
              </p>
            </>
          }
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Common Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g Weza Shop" {...field} />
              </FormControl>
              <FormDescription>
                Name used for the Community Asset Voucher (CAV)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Voucher Description</FormLabel>
              <FormControl>
                <Input placeholder="Voucher Description" {...field} />
              </FormControl>
              <FormDescription>
                Description of the Community Asset Voucher (CAV)
              </FormDescription>
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
                This is the symbol used for the CAV when exchanging
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Products</FormLabel>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className={cn("flex items-start space-x-2 flex-wrap", {
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
                      {index === fields.length - 1 && (
                        <FormDescription>
                          Name of product that your voucher is redeemable as
                          payment for
                        </FormDescription>
                      )}
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
                      {index === fields.length - 1 && (
                        <FormDescription>
                          Description of the product
                        </FormDescription>
                      )}
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
                      {index === fields.length - 1 && (
                        <FormDescription>
                          Quantity of the product that is avaliable using this
                          CAV
                        </FormDescription>
                      )}
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
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                        </SelectContent>
                      </Select>
                      {index === fields.length - 1 && (
                        <FormDescription>
                          How often that quantity of product is avaliable
                        </FormDescription>
                      )}
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