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
} from "@grassroots/validators/vouchers/create";
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
                Here you will name and describe your Community Asset Voucher (CAV) and also specify any special offerings that it is redeemable as payment for. Ensure that these products are available! If you are giving this CAV as a gift certificate and someone returns it to you as the issuer - you must redeem it as payment.
              </p>
              <br />
              <p>
                Note the value of the CAV (i.e. 1 CAV = $1 USD of your products)
                - will be determined in the next section.
              </p>
            </>
          }
        />

        <InputField
          form={form}
          name="name"
          label="Voucher Name"
          placeholder="e.g Weza Shop Points/Voucher/Gift Card"
          description="Name used for the Community Asset Voucher (CAV)"
        />
        <InputField
          form={form}
          name="symbol"
          label="Symbol"
          placeholder="e.g WEZA"
          description="This is how your CAV will appear in digital wallets"
        />
	<TextAreaField
          form={form}
          name="description"
          label="Voucher Description"
          placeholder="Access to Services at the Jackson Community Center"
          description="Tell people about your Community Asset Voucher (CAV)"
        />

        <div>
          <Alert
            title="Add Product Offers"
            variant="info"
            message="Adding at least 1 product offering is required"
          />
          <div className="flex justify-between items-center my-2">
            <FormLabel>Product(s):</FormLabel>
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
              Add Product Offering
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
                  label={"Product Offering Name"}
                  placeholder="e.g Training"
                  description="What is your CAV redeemable as payment for?"
                />
                <InputField
                  form={form}
                  name={`products.${index}.description`}
                  label="Description"
                  placeholder="e.g Education on public awareness"
                  description="What should we know about your goods or services?"
                />
                <div className="grid grid-cols-2 gap-2">
                  <InputField
                    form={form}
                    name={`products.${index}.quantity`}
                    type="number"
                    label="Quantity available"
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
                        label: "Daily",
                      },
                      {
                        value: "week",
                        label: "Weekly",
                      },
                      {
                        value: "month",
                        label: "Monthly",
                      },
                      {
                        value: "year",
                        label: "Yearly",
                      },
                    ]}
                    description="How often is the quantity available?"
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
