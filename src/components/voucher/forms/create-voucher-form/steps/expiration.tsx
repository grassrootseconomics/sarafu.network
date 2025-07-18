"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

export const redistributionPeriods = [
  { label: "1 Week", value: "10080" },
  { label: "1 Month", value: "43200" },
  { label: "6 Months", value: "259200" },
  { label: "1 Year", value: "518400" },
];
const voucherTypes: {
  value: (typeof VoucherType)[keyof typeof VoucherType];
  title: string;
  description: string;
  features: string[];
  perfectFor: string;
  badge: string;
  badgeVariant: "default" | "destructive" | "secondary";
}[] = [
  {
    value: VoucherType.GIFTABLE,
    title: "Standard Giftable Voucher",
    description: "Fixed or flexible supply with minting/burning capabilities",
    features: [
      "Vouchers circulate forever",
      "Fixed or flexible supply",
      "Minting/burning capabilities",
    ],
    perfectFor: "Loyalty points, stable vouchers",
    badge: "Standard",
    badgeVariant: "default" as const,
  },
  {
    value: VoucherType.GIFTABLE_EXPIRING,
    title: "Expiring Voucher (Time Limited)",
    description: "Transfer of vouchers stop working after a specific date",
    features: [
      "All features of Standard Giftable Voucher",
      "Hard expiration date (tokens become non-transferable)",
    ],
    perfectFor: "Promotional vouchers, time-limited campaigns",
    badge: "Time Limited",
    badgeVariant: "destructive" as const,
  },
  {
    value: VoucherType.DEMURRAGE,
    title: "Demurrage Vouchers (Decaying)",
    description:
      "A voucher that continuously loses value over time, with the lost value going to a community fund",
    features: [
      "Vouchers gradually decay at a set rate",
      "Decayed value is redistributed to a community fund",
      "Encourages spending instead of holding",
    ],
    perfectFor: "Local currencies, community vouchers, circulation incentives",
    badge: "Decaying",
    badgeVariant: "secondary" as const,
  },
];

export const ExpirationStep = () => {
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
  
  const account = useAccount();

  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Choose Your Voucher Type
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
                        <h4 className="font-medium text-sm mb-1">Features:</h4>
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
                          Perfect for:
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
              <CardTitle>Demurrage Settings</CardTitle>
              <CardDescription>
                Configure how your vouchers will decay over time and where the
                decayed value goes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <InputField
                form={form}
                name="rate"
                label="Decay Rate (%)"
                placeholder="e.g., 2"
                description="How much value decays per redistribution period"
              />
              <SelectField
                form={form}
                name="period"
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
                description="Where the decayed value goes for redistribution"
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
                    Use My Address
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}

        {type === VoucherType.GIFTABLE_EXPIRING && (
          <Card>
            <CardHeader>
              <CardTitle>Expiration Settings</CardTitle>
              <CardDescription>
                Set when your vouchers will stop being transferable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DateField
                form={form}
                name="expirationDate"
                label="Expiration Date"
                placeholder="Select date"
                description="When set, all vouchers freeze permanently on this date"
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
