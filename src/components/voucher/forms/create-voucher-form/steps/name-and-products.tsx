import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { WarningAlert } from "~/components/alert";
import { InputField } from "~/components/forms/fields/input-field";
import { SelectField } from "~/components/forms/fields/select-field";
import { Button } from "~/components/ui/button";
import { Form, FormLabel } from "~/components/ui/form";
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

        <InputField
          form={form}
          name="name"
          label="Common Name"
          placeholder="e.g Weza Shop"
          description="Name used for the Community Asset Voucher (CAV)"
        />
        <InputField
          form={form}
          name="description"
          label="Voucher Description"
          placeholder="Voucher Description"
          description="Description of the Community Asset Voucher (CAV)"
        />
        <InputField
          form={form}
          name="symbol"
          label="Symbol"
          placeholder="e.g WEZA"
          description="This is the symbol used for the CAV when exchanging"
        />

        <div>
          <div className="flex justify-between items-center my-2">
            <FormLabel>Products</FormLabel>
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
          <div className={"grid grid-cols-1 md:grid-cols-2 gap-2"}>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid relative grid-cols-1 col-span-1 p-2 px-4 shadow-lg rounded-md"
              >
                <InputField
                  form={form}
                  name={`products.${index}.name`}
                  label={"Product Name"}
                  placeholder="e.g Tomatoes"
                  description="Name of product that your voucher is redeemable as payment for"
                />
                <InputField
                  form={form}
                  name={`products.${index}.description`}
                  label="Description"
                  placeholder="e.g Fresh Tomatoes"
                  description="Description of the product"
                />
                <div className="grid grid-cols-2 gap-2">
                  <InputField
                    form={form}
                    name={`products.${index}.quantity`}
                    type="number"
                    label="Quantity"
                    placeholder="e.g 1"
                    description="Quantity of the product that is available using this CAV"
                  />
                  <SelectField
                    form={form}
                    name={`products.${index}.frequency`}
                    label={"Frequency"}
                    placeholder="e.g 1"
                    items={[
                      {
                        value: "day",
                        label: "Day",
                      },
                      {
                        value: "week",
                        label: "Week",
                      },
                      {
                        value: "month",
                        label: "Month",
                      },
                      {
                        value: "year",
                        label: "Year",
                      },
                    ]}
                    description="How often that quantity of product is available"
                  />
                </div>
                <Button
                  className="absolute top-2 right-2"
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <StepControls
          onNext={form.handleSubmit(onValid, (e) => console.error(e))}
        />
      </form>
    </Form>
  );
};
