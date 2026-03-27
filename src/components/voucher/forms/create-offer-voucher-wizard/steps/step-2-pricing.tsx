"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, InfoIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { InputField } from "~/components/forms/fields/input-field";
import { SelectField } from "~/components/forms/fields/select-field";
import { UnitField } from "~/components/forms/fields/unit-field";
import { UoaField } from "~/components/forms/fields/uoa-field";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { useOfferVoucherForm } from "../provider";
import { pricingSchema, type PricingFormValues } from "../schemas/pricing";

const frequencyItems = [
  { value: "day", label: "Per day" },
  { value: "week", label: "Per week" },
  { value: "month", label: "Per month" },
  { value: "year", label: "Per year" },
];

interface Step2Props {
  onComplete: () => void;
  onBack?: () => void;
}

export function Step2Pricing({ onComplete, onBack }: Step2Props) {
  const { values, onValid, defaultCurrency } = useOfferVoucherForm("pricing");

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    mode: "onBlur",
    defaultValues: {
      currency: values?.currency ?? defaultCurrency,
      price: values?.price ?? undefined,
      unit: values?.unit ?? "",
      quantity: values?.quantity ?? undefined,
      frequency: values?.frequency ?? undefined,
    },
  });

  const onSubmit = (data: PricingFormValues) => {
    onValid(data, onComplete);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Price Your Offer
        </h2>
        <p className="text-muted-foreground mt-1">
          Set the price and availability of your offer. This is how buyers will
          understand your voucher&apos;s value.
        </p>
      </div>

      <Alert>
        <InfoIcon className="size-4" />
        <AlertDescription>
          Set a fair market price in local currency. Buyers can pay with
          vouchers or local currency. You can update this later.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <UoaField form={form} name="currency" label="Currency" />

              <InputField
                form={form}
                name="price"
                type="number"
                label="Price"
                placeholder="0"
                description="Price in local currency"
              />

              <UnitField
                form={form}
                name="unit"
                label="Per (unit of measure)"
                placeholder="Select or type your own"
              />

              <InputField
                form={form}
                name="quantity"
                type="number"
                label="Quantity available"
                placeholder="e.g. 50"
                description="How much can you supply?"
              />

              <SelectField
                form={form}
                name="frequency"
                items={frequencyItems}
                label="Supply frequency"
                placeholder="How often can you supply?"
                description="Buyers will see this as your supply cadence."
              />

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={!onBack}
                >
                  <ArrowLeft className="mr-2 size-4" />
                  Back
                </Button>
                <Button type="submit">
                  Next
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
