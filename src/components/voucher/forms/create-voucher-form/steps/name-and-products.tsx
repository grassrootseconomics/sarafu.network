"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm } from "react-hook-form";
import { Alert, CollapsibleAlert } from "~/components/alert";
import { InputField } from "~/components/forms/fields/input-field";
import { SelectField } from "~/components/forms/fields/select-field";
import { TextAreaField } from "~/components/forms/fields/textarea-field";
import { Button } from "~/components/ui/button";
import { Form, FormLabel } from "~/components/ui/form";
import { StepControls } from "../controls";
import { useVoucherForm } from "../provider";
import {
  nameAndProductsSchema,
  type NameAndProductsFormValues,
} from "../schemas/name-and-products";

//(name/description), Quantity and Frequency (per day, week, month, year)

export const NameAndProductsStep = () => {
  const t = useTranslations("voucherCreation.nameAndProducts");
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
          title={t("moreInformation")}
          variant="info"
          message={
            <>
              <div
                dangerouslySetInnerHTML={{
                  __html: t.raw("infoContent") as TrustedHTML,
                }}
              />
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            form={form}
            name="name"
            label={t("voucherName")}
            placeholder={t("voucherNamePlaceholder")}
            description={t("voucherNameDescription")}
          />
          <InputField
            form={form}
            name="symbol"
            label={t("symbol")}
            placeholder={t("symbolPlaceholder")}
            description={t("symbolDescription")}
          />
        </div>
        <TextAreaField
          form={form}
          name="description"
          label={t("voucherDescription")}
          placeholder={t("voucherDescriptionPlaceholder")}
          description={t("voucherDescriptionDescription")}
        />

        <div className="space-y-4">
          <Alert
            title={t("addProductOffers")}
            variant="info"
            message={t("productOfferRequired")}
          />
          <div className="flex justify-between items-center">
            <FormLabel className="text-lg font-semibold">
              {t("products")}:
            </FormLabel>
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
              {t("addProductOffering")}
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
                    label={t("productOfferingName")}
                    placeholder={t("productOfferingNamePlaceholder")}
                    description={t("productOfferingNameDescription")}
                  />
                  <InputField
                    form={form}
                    name={`products.${index}.description`}
                    label={t("description")}
                    placeholder={t("descriptionPlaceholder")}
                    description={t("descriptionDescription")}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      form={form}
                      name={`products.${index}.quantity`}
                      type="number"
                      label={t("quantityAvailable")}
                      placeholder={t("quantityPlaceholder")}
                      description={t("quantityDescription")}
                    />
                    <SelectField
                      form={form}
                      name={`products.${index}.frequency`}
                      label={t("frequency")}
                      placeholder={t("frequencyPlaceholder")}
                      items={[
                        { value: "day", label: t("daily") },
                        { value: "week", label: t("weekly") },
                        { value: "month", label: t("monthly") },
                        { value: "year", label: t("yearly") },
                      ]}
                      description={t("frequencyDescription")}
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
