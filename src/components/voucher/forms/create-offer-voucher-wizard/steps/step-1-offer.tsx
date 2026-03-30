"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, InfoIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { ImageUploadField } from "~/components/forms/fields/image-upload-field";
import { InputField } from "~/components/forms/fields/input-field";
import { TagsField } from "~/components/forms/fields/tags-field";
import { TextAreaField } from "~/components/forms/fields/textarea-field";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { useOfferVoucherForm } from "../provider";
import { offerSchema, type OfferFormValues } from "../schemas/offer";

interface Step1Props {
  onComplete: () => void;
  onBack?: () => void;
}

export function Step1Offer({ onComplete, onBack }: Step1Props) {
  const { values, onValid } = useOfferVoucherForm("offer");

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    mode: "onBlur",
    defaultValues: {
      name: values?.name ?? "",
      description: values?.description ?? "",
      categories: values?.categories ?? [],
      photo:
        values?.photo ??
        "https://content.sarafu.network/voucher/bd10fd365101425f8bafeb6adfe8007c.jpg",
    },
  });

  const onSubmit = (data: OfferFormValues) => {
    onValid(data, onComplete);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Create Your Offer</h2>
        <p className="text-muted-foreground mt-1">
          Start by describing what you offer. This becomes your first listing on
          the network.
        </p>
      </div>

      <Alert>
        <InfoIcon className="size-4" />
        <AlertDescription>
          This is like listing an item or service in a marketplace. People can
          pay using vouchers or local currency.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <InputField
                form={form}
                name="name"
                label="Offer Name"
                placeholder="e.g. Organic Butternut Squash, 1 Hour Carpentry"
                description="Be specific — this is what buyers will see."
              />

              <TextAreaField
                form={form}
                name="description"
                label="Description"
                placeholder="Tell people more about your offer — quality, sourcing, what's included…"
                rows={3}
              />

              <TagsField
                form={form}
                name="categories"
                mode="multiple"
                label="Categories"
                placeholder="Search or add categories..."
              />

              <ImageUploadField
                form={form}
                name="photo"
                folder="offers"
                label="Offer Photo"
                description="Helps buyers find and trust your offer"
                aspectRatio={4 / 3}
              />

              <p className="text-sm text-muted-foreground">
                You can add more later. Start with just one thing you&apos;re
                confident in providing.
              </p>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={!onBack}
                >
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
