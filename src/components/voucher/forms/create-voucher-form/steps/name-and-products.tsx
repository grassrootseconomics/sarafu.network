"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Alert, CollapsibleAlert } from "~/components/alert";
import { InputField } from "~/components/forms/fields/input-field";
import { SelectField } from "~/components/forms/fields/select-field";
import { Button } from "~/components/ui/button";
import { Form, FormLabel } from "~/components/ui/form";
import { StepControls } from "../controls";
import { useVoucherForm } from "../provider";
import {
  nameAndProductsSchema,
  type NameAndProductsFormValues,
} from "../schemas/name-and-products";
import { TextAreaField } from "~/components/forms/fields/textarea-field";

//(name/description), Quantity and Frequency (per day, week, month, year)

export const NameAndProductsStep = () => {
  const { values, onValid } = useVoucherForm("nameAndProducts");

  const form = useForm<NameAndProductsFormValues>({
    resolver: zodResolver(nameAndProductsSchema),
    mode: "onChange",
    defaultValues: values ?? {
      products: [],
    },
  });
  const { fields, prepend, remove } = useFieldArray({
    name: "products",
    control: form.control,
  });

  return (
    <Form {...form}>
      <form className="space-y-8">
        <CollapsibleAlert
          title="More Information"
          variant="info"
          message={
            <>
              <p>
                Here you will name and describe your Community Asset Voucher
                (CAV) and also specify any special offerings that it represents.
                Ensure that these offerings are valid!
              </p>
              <br />
              <p>
                Note the value of the CAV (i.e. 1 CAV = $1 USD of your products
                or 1 hour of achievments) - will be determined in the next
                section.
              </p>
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            form={form}
            name="name"
            label="Voucher Name"
            placeholder="e.g Weza Shop Points/Voucher/Gift Card/Cerfiticate"
            description="Name used for the Voucher"
          />
          <InputField
            form={form}
            name="symbol"
            label="Symbol"
            placeholder="e.g WEZA"
            description="This symbol is how your CAV will appear in digital wallets"
          />
        </div>
        <TextAreaField
          form={form}
          name="description"
          label="Voucher Description"
          placeholder="e.g. Access to Services at the Jackson Community Center"
          description="Tell people about what this voucher represents"
        />

        <div className="space-y-4">
          <Alert
            title="Add Product Offers"
            variant="info"
            message="Adding at least 1 product offering or achievment is required"
          />
          <div className="flex justify-between items-center">
            <FormLabel className="text-lg font-semibold">Product(s):</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                prepend({
                  name: "",
                  description: "",
                  quantity: 1,
                  frequency: "day",
                })
              }
            >
              Add Product Offering or Achievement
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
              >
                <Button
                  className="absolute top-2 right-2"
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="space-y-4">
                  <InputField
                    form={form}
                    name={`products.${index}.name`}
                    label="Product Offering Name"
                    placeholder="e.g Training"
                    description="What does our Voucher represent?"
                  />
                  <InputField
                    form={form}
                    name={`products.${index}.description`}
                    label="Description"
                    placeholder="e.g Education on public awareness"
                    description="What should we know about it?"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      form={form}
                      name={`products.${index}.quantity`}
                      type="number"
                      label="Quantity available"
                      placeholder="e.g 1"
                      description="How much is avaliable?"
                    />
                    <SelectField
                      form={form}
                      name={`products.${index}.frequency`}
                      label="Frequency"
                      placeholder="e.g 1"
                      items={[
                        { value: "day", label: "Daily" },
                        { value: "week", label: "Weekly" },
                        { value: "month", label: "Monthly" },
                        { value: "year", label: "Yearly" },
                      ]}
                      description="How often is it available?"
                    />
                  </div>
                </div>
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
