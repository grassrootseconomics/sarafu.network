import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
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
    .nonempty("Voucher Name is required")
    .min(3, "Voucher Name must be at least 3 characters")
    .max(32, "Voucher Name must be at most 32 characters"),
  symbol: z
    .string()
    .nonempty("Symbol is required")
    .min(1, "Symbol Name must be at least 2 characters")
    .max(6, "Symbol Name must be at most 6 characters")
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
      { message: "Symbol already exists in the Token Index" }
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Voucher Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g Weza" {...field} />
              </FormControl>
              {<FormMessage /> || (
                <FormDescription>Name used for the voucher</FormDescription>
              )}
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
              {<FormMessage /> || (
                <FormDescription>
                  This is the symbol used for the voucher
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <div className="flex space-x-2" key={field.id}>
              <FormField
                control={form.control}
                key={field.id}
                name={`products.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && "sr-only")}>
                      Product Name
                    </FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g Tomatoes"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            append({
                              name: "",
                              description: "",
                              quantity: 0,
                              frequency: "day",
                            });
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription
                      className={cn(index !== fields.length - 1 && "sr-only")}
                    >
                      Enter the name of the product
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`products.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && "sr-only")}>
                      Product Description
                    </FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g Fresh tomatoes"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            append({
                              name: "",
                              description: "",
                              quantity: 0,
                              frequency: "day",
                            });
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription
                      className={cn(index !== fields.length - 1 && "sr-only")}
                    >
                      Enter a description for the product
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`products.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && "sr-only")}>
                      Quantity
                    </FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g 10"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            append({
                              name: "",
                              description: "",
                              quantity: 0,
                              frequency: "day",
                            });
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription
                      className={cn(index !== fields.length - 1 && "sr-only")}
                    >
                      Enter the quantity of the product
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`products.${index}.frequency`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && "sr-only")}>
                      Frequency
                    </FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g day"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            append({
                              name: "",
                              description: "",
                              quantity: 0,
                              frequency: "day",
                            });
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription
                      className={cn(index !== fields.length - 1 && "sr-only")}
                    >
                      Enter the frequency of the product availability
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                onClick={() => remove(index)}
                variant={"ghost"}
                size={"icon"}
                className="ml-2"
              >
                <X />
              </Button>
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
