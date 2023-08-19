import { Button } from "~/components/ui/button";
import { Step, Steps, type StepConfig } from "~/components/ui/stepper";
import { useStepper } from "~/components/ui/use-stepper";

const steps = [
  { label: "Introduction" },
  { label: "Step 2" },
  { label: "Step 3" },
] satisfies StepConfig[];

const InfomationStep = () => {
  return (
    <div className="w-full rounded-lg p-4 text-left">
      <p>
        Community Inclusion Currencies (CICs) are a form of voucher that has the
        ability to be reassigned to someone else hence traded. The terms and
        conditions around your CIC are based on an agreement signed by the
        issuer or issuers who publish the CIC on a common ledger (Celo
        Blockchain). This walkthrough will guide you through the steps to
        publish your own voucher or the voucher of an association that you
        represent.
      </p>
      <br />
      <p>
        The purpose of a CIC as a voucher is to create an instrument that allows
        you to make a commitment as a contract redeemable by you or your
        association.
      </p>
      <br />
      <p>
        What is the overarching goal of this CIC and specifically what needs to
        be done in your community? As with all group processes, listening and
        patience are important to enable all voices to be heard. This process is
        iterative, your community will go back and refine these concepts before
        launching a CIC. Setting a time period to develop your CIC and reach
        your goals as a community is also important, as well as defining how the
        CIC will be used in projects. What will the demand for this CIC be in
        each project? This step can also be contructed as a typical social
        enterprise business plan which incorporates community ownership and
        support.
      </p>
      <br />
      <p>
        This introduction will explore the fundamental concepts that together
        compose CIC Vouchers and help you and your community to design and
        publish your own.
      </p>
      <br />
      <p>We will cover:</p>
      <br />
      <ol type="1">
        <li>
          <strong>About you</strong>: Who is issuing the voucher?
        </li>
        <li>
          <strong>Name and Products</strong>: What will your CIC be called and
          what (XYZ) products is it redeemable as payment for?
        </li>
        <li>
          <strong>Value and Supply</strong>: How is the value of your voucher
          measured? What is the unit of account (like USD or Eggs) and how much
          is one voucher worth in that unit of account of your products? I.e. 1
          Voucher is redeemable as payment for 1 USD of my XYZ products. Not
          that you have defined your voucher’s value, what is your supply? How
          many vouchers should be created? What is the total value of your
          supply?
        </li>
        <li>
          <strong>Expiration</strong>: When should the vouchers expire and where
          should those expired vouchers be renewed (Community Fund).
        </li>
        <li>
          <strong>Options</strong>: What custom options do you want on your
          voucher? Registry, sealing?
        </li>
        <li>
          Signing and Publishing: This is the final step where you sign the
          agreement with your account key and publish the CIC on a public
          ledger.
        </li>
      </ol>
    </div>
  );
};
export default function StepperDemo() {
  const {
    nextStep,
    prevStep,
    resetSteps,
    activeStep,
    isDisabledStep,
    isLastStep,
    isOptionalStep,
  } = useStepper({
    initialStep: 0,
    steps,
  });

  return (
    <div className="flex w-full flex-col gap-4 p-4">
      <Steps activeStep={activeStep} orientation="horizontal">
        {steps.map((step, index) => (
          <Step index={index} key={index} {...step}>
            <InfomationStep />
          </Step>
        ))}
      </Steps>
      <div className="flex items-center justify-end gap-2">
        {activeStep === steps.length ? (
          <>
            <h2>All steps completed!</h2>
            <Button onClick={resetSteps}>Reset</Button>
          </>
        ) : (
          <>
            <Button disabled={isDisabledStep} onClick={prevStep}>
              Prev
            </Button>
            <Button onClick={nextStep}>
              {isLastStep ? "Finish" : isOptionalStep ? "Skip" : "Next"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
