import { zodResolver } from "@hookform/resolvers/zod";
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
          label="Who is the issuer of this voucher and liable to redeem is as payment?"
          items={[
            { label: "Personal (You yourself)", value: "personal" },
            {
              label: "Entity or Association that you duly represent",
              value: "group",
            },
          ]}
        />

        {type === "group" && (
          <RadioField
            form={form}
            name="authorized"
            label="Are you a duly authorized representation of an entity or association?"
            items={[
              { label: "No", value: "no" },
              { label: "Yes", value: "yes" },
            ]}
          />
        )}
        <InputField
          form={form}
          name="name"
          label={type === "group" ? "Entity/Association Name" : "Your Name"}
          placeholder={type === "group" ? "Grassroots Economics" : "Your Name"}
        />
        <InputField
          form={form}
          name="email"
          label={"Contact Information"}
          description="This is the email address that people can contact you on.
          "
          placeholder={
            type === "group" ? "james@grassecon.org" : "your@email.com"
          }
        />
        <InputField
          form={form}
          name="website"
          label={"Website"}
          description="If you have a website, you can enter it here."
          placeholder={"https://grassecon.org"}
        />
        <MapField
          form={form}
          label="Where can this Voucher be redeemed?"
          description="This is the name of the location where the voucher is valid."
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
