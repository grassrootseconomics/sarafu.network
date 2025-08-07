"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { InputField } from "~/components/forms/fields/input-field";
import { MapField } from "~/components/forms/fields/map-field";
import { RadioField } from "~/components/forms/fields/radio-field";
import { Form } from "~/components/ui/form";
import { StepControls } from "../controls";
import { useVoucherForm } from "../provider";
import { aboutYouSchema, type AboutYouFormValues } from "../schemas/about-you";

// This can come from your database or API.
const defaultValues: Partial<AboutYouFormValues> = {
  type: "personal",
};

export const AboutYouStep = () => {
  const t = useTranslations("voucherCreation.aboutYou");
  const { values, onValid } = useVoucherForm("aboutYou");

  const form = useForm<AboutYouFormValues>({
    resolver: zodResolver(aboutYouSchema),
    mode: "onChange",
    defaultValues: values ?? defaultValues,
    progressive: true,
  });

  const type = form.watch("type");
  return (
    <Form {...form}>
      <form className="space-y-8">
        <RadioField
          form={form}
          name="type"
          label={t("whoIsIssuer")}
          items={[
            { label: t("personal"), value: "personal" },
            {
              label: t("entity"),
              value: "group",
            },
          ]}
        />

        {type === "group" && (
          <RadioField
            form={form}
            name="authorized"
            label={t("authorizedRepresentation")}
            items={[
              { label: t("no"), value: "no" },
              { label: t("yes"), value: "yes" },
            ]}
          />
        )}
        <InputField
          form={form}
          name="name"
          label={type === "group" ? t("entityName") : t("yourName")}
          placeholder={type === "group" ? t("entityPlaceholder") : t("yourNamePlaceholder")}
        />
        <InputField
          form={form}
          name="email"
          label={t("contactInformation")}
          description={t("contactDescription")}
          placeholder={
            type === "group" ? t("groupEmailPlaceholder") : t("personalEmailPlaceholder")
          }
        />
        <InputField
          form={form}
          name="website"
          label={t("website")}
          description={t("websiteDescription")}
          placeholder={t("websitePlaceholder")}
        />
        <MapField
          form={form}
          label={t("locationQuestion")}
          description={t("locationDescription")}
          name={"geo"}
          locationName={"location"}
        />
        <StepControls
          onNext={form.handleSubmit(onValid, (e) => console.error(e))}
        />
      </form>
    </Form>
  );
};
