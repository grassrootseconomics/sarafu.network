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
export const nameAndProductsSchema = z.object({
  name: z.string().nonempty("Name is required"),
  symbol: z
    .string()
    .nonempty("Symbol is required")
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
  products: z
    .array(
      z.object({
        value: z.string(),
      })
    )
    .optional(),
});
export type FormValues = z.infer<typeof nameAndProductsSchema>;

export const NameAndProductsStep = () => {
  const { values, onValid } = useVoucherForm("nameAndProducts");

  const form = useForm<FormValues>({
    resolver: zodResolver(nameAndProductsSchema),
    mode: "onChange",
    defaultValues: values ?? {
      products: [{ value: "" }],
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
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
                <Input placeholder="Symbol" {...field} />
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
            <FormField
              control={form.control}
              key={field.id}
              name={`products.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && "sr-only")}>
                    Products
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && "sr-only")}>
                    What goods/services is it redeemable as payment for?
                  </FormDescription>
                  <FormControl>
                    <div className="flex">
                      <Input {...field} />
                      <Button
                        onClick={() => remove(index)}
                        variant={"ghost"}
                        size={"icon"}
                        className="ml-2"
                      >
                        <X />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ value: "" })}
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
