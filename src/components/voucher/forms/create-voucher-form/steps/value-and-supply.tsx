"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Alert, CollapsibleAlert } from "~/components/alert";
import { ComboBoxField } from "~/components/forms/fields/combo-box-field";
import { InputField } from "~/components/forms/fields/input-field";
import { Form } from "~/components/ui/form";
import { StepControls } from "../controls";
import { useVoucherData, useVoucherForm } from "../provider";
import {
  valueAndSupplySchema,
  type ValueAndSupplyFormValues,
} from "../schemas/value-and-supply";

// This can come from your database or API.
const defaultValues: Partial<ValueAndSupplyFormValues> = {
  uoa: "USD",
};

// Predefined unit of account options
const options = ["USD", "EUR", "KSH", "Hour"];

export const ValueAndSupplyStep = () => {
  const t = useTranslations("voucherCreation.valueAndSupply");
  const { values, onValid } = useVoucherForm("valueAndSupply");
  const data = useVoucherData();
  const form = useForm<ValueAndSupplyFormValues>({
    resolver: zodResolver(valueAndSupplySchema),
    mode: "onChange",
    defaultValues: values ?? defaultValues,
  });
  const [uoaOptions, setUoaOptions] = useState(
    values?.uoa && !options.includes(values.uoa)
      ? [...options, values.uoa]
      : options
  );

  const uoa = form.watch("uoa");
  const value = form.watch("value");
  const supply = form.watch("supply");

  // Handler to create a new UOA option
  const handleCreateUoa = (query: string) => {
    setUoaOptions([...uoaOptions, query]);
    return query;
  };

  return (
    <Form {...form}>
      <form className="space-y-8">
        <CollapsibleAlert
          title={t("moreInformation.title")}
          variant="info"
          message={
            <div
              dangerouslySetInnerHTML={{
                __html: t.raw("moreInformation.content") as TrustedHTML,
              }}
            />
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComboBoxField
            form={form}
            name="uoa"
            label={t("unitOfAccount.label")}
            placeholder={t("unitOfAccount.placeholder")}
            description={t("unitOfAccount.description")}
            options={uoaOptions}
            getValue={(option) => option}
            getLabel={(option) => option}
            onCreate={handleCreateUoa}
            mode="single"
          />
          <InputField
            form={form}
            name="value"
            label={t("valuePerUnit.label")}
            placeholder={t("valuePerUnit.placeholder")}
            description={t("valuePerUnit.description", {
              value: value ?? 10,
              uoa: uoa ?? "USD"
            })}
          />
        </div>
        <InputField
          form={form}
          name="supply"
          label={t("supply.label")}
          placeholder={t("supply.placeholder")}
          description={t("supply.description")}
        />
        <Alert
          title={t("totalValue.title")}
          variant="info"
          message={t("totalValue.message", {
            supply: supply ?? 0,
            symbol: data.nameAndProducts?.symbol ?? "",
            totalValue: (supply ?? 0) * (value ?? 0),
            uoa: uoa ?? ""
          })}
        />
        <StepControls
          onNext={form.handleSubmit(onValid, (e) => console.error(e))}
        />
      </form>
    </Form>
  );
};
