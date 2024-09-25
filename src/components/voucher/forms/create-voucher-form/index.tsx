"use client";
import {
  CircleIcon,
  InfoIcon,
  Settings,
  Ticket,
  TimerIcon,
  UploadIcon,
  User2,
} from "lucide-react";
import { CreateVoucherProvider } from "./provider";
import { aboutYouSchema } from "./schemas/about-you";
import { expirationSchema } from "./schemas/expiration";
import { nameAndProductsSchema } from "./schemas/name-and-products";
import { optionsSchema } from "./schemas/options";
import { signingAndPublishingSchema } from "./schemas/sigining-and-publishing";
import { valueAndSupplySchema } from "./schemas/value-and-supply";
import Stepper from "./stepper";
import { AboutYouStep } from "./steps/about-you";
import { ExpirationStep } from "./steps/expiration";
import { IntroductionStep } from "./steps/introduction";
import { NameAndProductsStep } from "./steps/name-and-products";
import { OptionsStep } from "./steps/options";
import { ReviewStep } from "./steps/sigining-and-publishing";
import { ValueAndSupplyStep } from "./steps/value-and-supply";

export const steps = [
  {
    label: "Introduction",
    children: <IntroductionStep />,
    schema: undefined,
    icon: <InfoIcon />,
  },
  {
    label: "About you",
    children: <AboutYouStep />,
    schema: aboutYouSchema,
    icon: <User2 />,
  },
  {
    label: "Name and Products",
    children: <NameAndProductsStep />,
    schema: nameAndProductsSchema,
    icon: <Ticket />,
  },
  {
    label: "Value and Supply",
    children: <ValueAndSupplyStep />,
    schema: valueAndSupplySchema,
    icon: <CircleIcon />,
  },
  {
    label: "Expiration",
    children: <ExpirationStep />,
    schema: expirationSchema,
    icon: <TimerIcon />,
  },
  {
    label: "Options",
    children: <OptionsStep />,
    schema: optionsSchema,
    icon: <Settings />,
  },
  {
    label: "Signing And Publishing",
    children: <ReviewStep />,
    schema: signingAndPublishingSchema,
    icon: <UploadIcon />,
  },
];

export default function VoucherStepper() {
  return (
    <CreateVoucherProvider steps={steps}>
      <StepContent />
    </CreateVoucherProvider>
  );
}
function StepContent() {
  return (
    <div className="flex w-full max-w-3xl mx-auto flex-col gap-4 p-4">
      <Stepper steps={steps} />
    </div>
  );
}
