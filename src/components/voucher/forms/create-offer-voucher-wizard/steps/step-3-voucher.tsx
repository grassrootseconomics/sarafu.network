"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  InfoIcon,
  Ticket,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DateField } from "~/components/forms/fields/date-field";
import { InputField } from "~/components/forms/fields/input-field";
import { MapField } from "~/components/forms/fields/map-field";
import { SelectField } from "~/components/forms/fields/select-field";
import { TextAreaField } from "~/components/forms/fields/textarea-field";
import { UoaField } from "~/components/forms/fields/uoa-field";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Form } from "~/components/ui/form";
import { useAuth } from "~/hooks/use-auth";
import { VoucherType } from "~/server/enums";
import { useOfferVoucherData, useOfferVoucherForm } from "../provider";
import {
  voucherStepSchema,
  type VoucherStepFormValues,
} from "../schemas/voucher";

const voucherTypes = [
  {
    value: VoucherType.GIFTABLE,
    label: "Standard",
    description: "Circulates forever",
  },
  {
    value: VoucherType.GIFTABLE_EXPIRING,
    label: "Expiring",
    description: "Has an expiration date",
  },
  {
    value: VoucherType.DEMURRAGE,
    label: "Decaying",
    description: "Value decays over time",
  },
] as const;

const redistributionPeriods = [
  { label: "1 Week", value: "10080" },
  { label: "1 Month", value: "43200" },
  { label: "6 Months", value: "259200" },
  { label: "1 Year", value: "518400" },
];

interface Step3Props {
  onComplete: () => void;
  onBack?: () => void;
}

export function Step3Voucher({ onComplete, onBack }: Step3Props) {
  const { values, onValid } = useOfferVoucherForm("voucher");
  const allData = useOfferVoucherData();
  const auth = useAuth();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [symbolManuallySet, setSymbolManuallySet] = useState(!!values?.symbol);

  const form = useForm<VoucherStepFormValues>({
    resolver: zodResolver(voucherStepSchema),
    mode: "onBlur",
    defaultValues: {
      name: values?.name ?? "",
      shopDescription: values?.shopDescription ?? "",
      value: values?.value ?? 1,
      uoa: values?.uoa ?? allData.pricing?.currency ?? "",
      symbol: values?.symbol ?? "",
      location: values?.location ?? "",
      geo: values?.geo ?? undefined,
      supply: values?.supply ?? 1000,
      contactEmail: values?.contactEmail ?? "",
      voucherType: values?.voucherType ?? VoucherType.GIFTABLE,
      expirationDate: values?.expirationDate ?? undefined,
      demurrageRate: values?.demurrageRate ?? undefined,
      demurragePeriod: values?.demurragePeriod ?? undefined,
      communityFund: values?.communityFund ?? "",
    },
  });

  const watchedVoucherType = form.watch("voucherType");
  const watchedName = form.watch("name");

  // Auto-fill fields from user profile
  useEffect(() => {
    if (!auth?.user) return;
    if (!form.getValues("name") && auth.user.given_names) {
      form.setValue("name", `${auth.user.given_names}'s Voucher`);
    }
    if (!form.getValues("shopDescription") && auth.user.bio) {
      form.setValue("shopDescription", auth.user.bio);
    }
    if (!form.getValues("contactEmail") && auth.user.email) {
      form.setValue("contactEmail", auth.user.email);
    }
    if (!form.getValues("location") && auth.user.location_name) {
      form.setValue("location", auth.user.location_name);
    }
    if (!form.getValues("geo") && auth.user.geo) {
      form.setValue("geo", auth.user.geo);
    }
  }, [auth?.user, form]);

  // Auto-fill UoA from pricing currency
  useEffect(() => {
    if (!form.getValues("uoa") && allData.pricing?.currency) {
      form.setValue("uoa", allData.pricing.currency);
    }
  }, [allData.pricing?.currency, form]);

  // Auto-generate symbol from voucher name
  useEffect(() => {
    if (!symbolManuallySet && watchedName) {
      const autoSymbol =
        watchedName.split(/\s+/)[0]?.toUpperCase().slice(0, 6) ?? "";
      form.setValue("symbol", autoSymbol);
    }
  }, [watchedName, symbolManuallySet, form]);

  const onSubmit = (data: VoucherStepFormValues) => {
    onValid(data, onComplete);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Your Voucher (Gift Card)
        </h2>
      </div>

      <Alert>
        <Ticket className="size-4" />
        <AlertTitle>What&apos;s a voucher?</AlertTitle>
        <AlertDescription className="space-y-1.5 mt-1">
          <p>
            A voucher acts like a gift card for your offers. When someone
            redeems your voucher, you are committing to provide them with your
            offers.
          </p>
        </AlertDescription>
      </Alert>

      {allData.offer?.name && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Your Offer:</span>
          <Badge variant="secondary">{allData.offer.name}</Badge>
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <InputField
                form={form}
                name="name"
                label="Voucher Name"
                placeholder="e.g. Amina's Voucher"
              />

              <TextAreaField
                form={form}
                name="shopDescription"
                label="Voucher Description"
                placeholder="Tell people about your business..."
                description="Shown on your voucher page"
                rows={3}
              />

              {/* Advanced settings */}
              <div className="border-t pt-4">
                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-between"
                    >
                      <span className="text-sm font-medium">
                        Advanced voucher settings
                      </span>
                      {advancedOpen ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-6 pt-4">
                    <InputField
                      form={form}
                      name="value"
                      type="number"
                      label="Voucher Value"
                      placeholder="1"
                      description={`${allData.pricing?.currency ?? "Currency"} worth of goods & services`}
                    />
                    <UoaField form={form} name="uoa" label="Unit of Account" />

                    <InputField
                      form={form}
                      name="symbol"
                      label="Voucher Symbol"
                      placeholder="e.g. AMINA"
                      description="Short ticker, max 6 characters"
                      // eslint-disable-next-line @typescript-eslint/no-misused-promises
                      onChange={() => setSymbolManuallySet(true)}
                    />

                    <MapField
                      form={form}
                      name="geo"
                      label="Location"
                      locationName="location"
                    />

                    <InputField
                      form={form}
                      name="supply"
                      type="number"
                      label="Total Supply"
                      placeholder="1000"
                      description="Maximum vouchers to issue. Leave blank for flexible supply."
                    />

                    <InputField
                      form={form}
                      name="contactEmail"
                      type="email"
                      label="Contact Email"
                      placeholder="you@example.com"
                      description="Business contact if different from your account email"
                    />

                    {/* Voucher Type Selector */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Voucher Type</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {voucherTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() =>
                              form.setValue("voucherType", type.value)
                            }
                            className={`rounded-lg border-2 p-3 text-left transition-colors ${
                              watchedVoucherType === type.value
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-muted-foreground/30"
                            }`}
                          >
                            <p className="text-sm font-medium">{type.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {type.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Conditional fields */}
                    {watchedVoucherType === VoucherType.GIFTABLE_EXPIRING && (
                      <DateField
                        form={form}
                        name="expirationDate"
                        label="Expiration Date"
                        description="When does this voucher expire?"
                      />
                    )}

                    {watchedVoucherType === VoucherType.DEMURRAGE && (
                      <div className="space-y-6">
                        <Alert>
                          <InfoIcon className="size-4" />
                          <AlertDescription>
                            Decaying vouchers lose value over time. The decayed
                            value is sent to the community fund address.
                          </AlertDescription>
                        </Alert>
                        <InputField
                          form={form}
                          name="demurrageRate"
                          type="number"
                          label="Decay Rate (%)"
                          placeholder="2"
                          description="Percentage of value that decays each period"
                        />

                        <SelectField
                          form={form}
                          name="demurragePeriod"
                          label="Redistribution Period"
                          placeholder="Select period"
                          description="How often decayed value moves to the community fund"
                          items={redistributionPeriods}
                        />
                        <InputField
                          form={form}
                          name="communityFund"
                          label="Community Fund Address"
                          placeholder="0x..."
                          description="Address where decayed value is sent"
                        />
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>

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
