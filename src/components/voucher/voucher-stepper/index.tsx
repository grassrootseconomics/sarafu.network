import { Step, Steps } from "~/components/ui/stepper";
import { CreateVoucherProvider, useVoucherStepper } from "./provider";
import { AboutYouStep, aboutYouSchema } from "./steps/about-you";
import { ExpirationStep, expirationSchema } from "./steps/expiration";
import { IntroductionStep } from "./steps/introduction";
import {
  NameAndProductsStep,
  nameAndProductsSchema,
} from "./steps/name-and-products";
import { OptionsStep, optionsSchema } from "./steps/options";
import { SigningAndPublishingStep } from "./steps/signing-and-publishing";
import {
  ValueAndSupplyStep,
  valueAndSupplySchema,
} from "./steps/value-and-supply";

export const steps = [
  {
    label: "Introduction",
    children: <IntroductionStep />,
    schema: undefined,
  },
  {
    label: "About you",
    children: <AboutYouStep />,
    schema: aboutYouSchema,
  },
  {
    label: "Name and Products",
    children: <NameAndProductsStep />,
    schema: nameAndProductsSchema,
  },
  {
    label: "Value and Supply",
    children: <ValueAndSupplyStep />,
    schema: valueAndSupplySchema,
  },
  {
    label: "Expiration",
    children: <ExpirationStep />,
    schema: expirationSchema,
  },
  {
    label: "Options",
    children: <OptionsStep />,
    schema: optionsSchema,
  },
  {
    label: "Signing and Publishing",
    children: <SigningAndPublishingStep />,
    schema: undefined,
  },
];
interface Step {
  label: string;
  children: React.ReactNode;
}
export default function VoucherStepper() {
  return (
    <CreateVoucherProvider steps={steps}>
      <StepContent />
    </CreateVoucherProvider>
  );
}
function StepContent() {
  const { activeStep, setStep } = useVoucherStepper();
  return (
    <div className="flex w-full flex-col gap-4 p-4">
      <Steps
        activeStep={activeStep}
        orientation="horizontal"
        onClickStep={(i) => setStep(i)}
      >
        {steps.map((step, index) => (
          <Step index={index} key={index} label={step.label}>
            {step.children}
          </Step>
        ))}
      </Steps>
    </div>
  );
}
