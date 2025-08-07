"use client";
import {
  CircleIcon,
  InfoIcon,
  Ticket,
  TimerIcon,
  UploadIcon,
  User2,
} from "lucide-react";
import { CreateVoucherProvider } from "./provider";
import { aboutYouSchema } from "./schemas/about-you";
import { expirationSchema } from "./schemas/expiration";
import { nameAndProductsSchema } from "./schemas/name-and-products";
import { signingAndPublishingSchema } from "./schemas/sigining-and-publishing";
import { valueAndSupplySchema } from "./schemas/value-and-supply";
import Stepper from "./stepper";
import { AboutYouStep } from "./steps/about-you";
import { ExpirationStep } from "./steps/expiration";
import { IntroductionStep } from "./steps/introduction";
import { NameAndProductsStep } from "./steps/name-and-products";
import { ReviewStep } from "./steps/sigining-and-publishing";
import { ValueAndSupplyStep } from "./steps/value-and-supply";

export const steps = [
  {
    label: "steps.introduction",
    children: <IntroductionStep />,
    schema: undefined,
    icon: <InfoIcon />,
  },
  {
    label: "steps.aboutYou",
    children: <AboutYouStep />,
    schema: aboutYouSchema,
    icon: <User2 />,
  },
  {
    label: "steps.nameAndProducts",
    children: <NameAndProductsStep />,
    schema: nameAndProductsSchema,
    icon: <Ticket />,
  },
  {
    label: "steps.valueAndSupply",
    children: <ValueAndSupplyStep />,
    schema: valueAndSupplySchema,
    icon: <CircleIcon />,
  },
  {
    label: "steps.expiration",
    children: <ExpirationStep />,
    schema: expirationSchema,
    icon: <TimerIcon />,
  },
  {
    label: "steps.signingAndPublishing",
    children: <ReviewStep />,
    schema: signingAndPublishingSchema,
    icon: <UploadIcon />,
  },
];

export default function VoucherStepper() {
  return (
    <CreateVoucherProvider steps={steps}>
      <div className="flex w-full max-w-3xl mx-auto flex-col gap-4">
        <Stepper steps={steps} />
      </div>
    </CreateVoucherProvider>
  );
}
