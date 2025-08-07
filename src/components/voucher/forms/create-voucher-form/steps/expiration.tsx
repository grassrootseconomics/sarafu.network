"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useAccount } from "wagmi";
import { type z } from "zod";
import { DateField } from "~/components/forms/fields/date-field";
import { InputField } from "~/components/forms/fields/input-field";
import { SelectField } from "~/components/forms/fields/select-field";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { VoucherType } from "~/server/enums";
import { StepControls } from "../controls";
import { useVoucherForm } from "../provider";
import { expirationSchema } from "../schemas/expiration";

const defaultValues = {
  type: VoucherType.GIFTABLE,
};

export const getRedistributionPeriods = (t: any) => [
  { label: t("periods.oneWeek"), value: "10080" },
  { label: t("periods.oneMonth"), value: "43200" },
  { label: t("periods.sixMonths"), value: "259200" },
  { label: t("periods.oneYear"), value: "518400" },
];
const getVoucherTypes = (t: any): {
  value: (typeof VoucherType)[keyof typeof VoucherType];
  title: string;
  description: string;
  features: string[];
  perfectFor: string;
  badge: string;
  badgeVariant: "default" | "destructive" | "secondary";
}[] => [
  {
    value: VoucherType.GIFTABLE,
    title: t("voucherTypes.standard.title"),
    description: t("voucherTypes.standard.description"),
    features: [
      t("voucherTypes.standard.features.0"),
      t("voucherTypes.standard.features.1"),
      t("voucherTypes.standard.features.2"),
    ],
    perfectFor: t("voucherTypes.standard.perfectFor"),
    badge: t("voucherTypes.standard.badge"),
    badgeVariant: "default" as const,
  },
  {
    value: VoucherType.GIFTABLE_EXPIRING,
    title: t("voucherTypes.expiring.title"),
    description: t("voucherTypes.expiring.description"),
    features: [
      t("voucherTypes.expiring.features.0"),
      t("voucherTypes.expiring.features.1"),
    ],
    perfectFor: t("voucherTypes.expiring.perfectFor"),
    badge: t("voucherTypes.expiring.badge"),
    badgeVariant: "destructive" as const,
  },
  {
    value: VoucherType.DEMURRAGE,
    title: t("voucherTypes.demurrage.title"),
    description: t("voucherTypes.demurrage.description"),
    features: [
      t("voucherTypes.demurrage.features.0"),
      t("voucherTypes.demurrage.features.1"),
      t("voucherTypes.demurrage.features.2"),
    ],
    perfectFor: t("voucherTypes.demurrage.perfectFor"),
    badge: t("voucherTypes.demurrage.badge"),
    badgeVariant: "secondary" as const,
  },
];

export const ExpirationStep = () => {
  const t = useTranslations("voucherCreation.expiration");
  const { values, onValid } = useVoucherForm("expiration");

  const form = useForm<
    z.input<typeof expirationSchema>,
    unknown,
    z.output<typeof expirationSchema>
  >({
    resolver: zodResolver(expirationSchema),
    mode: "onChange",
    defaultValues: values ?? defaultValues,
  });

  const type = form.watch("type");
  const voucherTypes = getVoucherTypes(t);
  const redistributionPeriods = getRedistributionPeriods(t);
  
  const account = useAccount();

  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("chooseVoucherType")}
            </h3>
            <div className="grid gap-4">
              {voucherTypes.map((voucherType) => (
                <Card
                  key={voucherType.value}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    type === voucherType.value
                      ? "ring-2 ring-blue-500 border-blue-500"
                      : ""
                  }`}
                  onClick={() => form.setValue("type", voucherType.value)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <input
                          type="radio"
                          name="type"
                          value={voucherType.value}
                          checked={type === voucherType.value}
                          onChange={() =>
                            form.setValue("type", voucherType.value)
                          }
                          className="h-4 w-4"
                        />
                        {voucherType.title}
                      </CardTitle>
                      <Badge variant={voucherType.badgeVariant}>
                        {voucherType.badge}
                      </Badge>
                    </div>
                    <CardDescription>{voucherType.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium text-sm mb-1">{t("features")}:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {voucherType.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          {t("perfectFor")}:
                        </h4>
                        <p className="text-sm text-blue-600">
                          {voucherType.perfectFor}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {type === VoucherType.DEMURRAGE && (
          <Card>
            <CardHeader>
              <CardTitle>{t("demurrageSettings.title")}</CardTitle>
              <CardDescription>
                {t("demurrageSettings.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <InputField
                form={form}
                name="rate"
                label={t("demurrageSettings.decayRate")}
                placeholder={t("demurrageSettings.decayRatePlaceholder")}
                description={t("demurrageSettings.decayRateDescription")}
              />
              <SelectField
                form={form}
                name="period"
                label={t("demurrageSettings.redistributionPeriod")}
                placeholder={t("demurrageSettings.selectPeriod")}
                description={t("demurrageSettings.redistributionDescription")}
                items={redistributionPeriods}
              />
              <InputField
                form={form}
                name="communityFund"
                label={t("demurrageSettings.communityFundAddress")}
                placeholder="0x..."
                description={t("demurrageSettings.communityFundDescription")}
                endAdornment={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      if (account && account.address) {
                        form.setValue("communityFund", account.address);
                      }
                    }}
                  >
                    {t("demurrageSettings.useMyAddress")}
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}

        {type === VoucherType.GIFTABLE_EXPIRING && (
          <Card>
            <CardHeader>
              <CardTitle>{t("expirationSettings.title")}</CardTitle>
              <CardDescription>
                {t("expirationSettings.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DateField
                form={form}
                name="expirationDate"
                label={t("expirationSettings.expirationDate")}
                placeholder={t("expirationSettings.selectDate")}
                description={t("expirationSettings.expirationDescription")}
              />
            </CardContent>
          </Card>
        )}

        <StepControls
          onNext={form.handleSubmit(onValid, (e) => console.error(e))}
        />
      </form>
    </Form>
  );
};
