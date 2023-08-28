import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useVoucherStepper } from "../provider";

export const IntroductionStep = () => {
  const stepper = useVoucherStepper();
  return (
    <div className="w-full rounded-lg p-4 text-left">
      <Card>
        <CardHeader>
          <CardTitle>Community Inclusion Currencies (CICs) Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Community Inclusion Currencies (CICs) are tradable vouchers, their
            rules set by the issuing party or parties on the Celo Blockchain.
            This guide will help you design and release your own CIC or one for
            an association you represent.
          </p>
          <p>
            The essence of a CIC is to offer a contractual promise, redeemable
            either by you or an association.
          </p>
          <p>
            The CIC's ultimate aim is community improvement. When planning it,
            listening to everyone and refining concepts are crucial. Setting a
            timeline and defining the CIC's application in projects is also
            vital. Think of this planning as creating a social enterprise
            business plan, but with community involvement.
          </p>
          <br />
          <p>Here's what we'll discuss:</p>
          <br />

          <ul>
            <li>
              <strong>Issuer Details</strong>: Who's creating the CIC?
            </li>
            <li>
              <strong>Naming & Purpose</strong>: What's your CIC's name and what
              can it be exchanged for?
            </li>
            <li>
              <strong>Valuation & Amount</strong>: How much is the CIC worth and
              in what terms (e.g., USD or Eggs)? How many CICs will you produce
              and what's their total worth?
            </li>
            <li>
              <strong>Expiry</strong>: When do CICs expire, and where are they
              renewed?
            </li>
            <li>
              <strong>Customization</strong>: Any special features for your CIC?
            </li>
            <li>
              <strong>Finalization</strong>: Here, you'll seal the deal and
              release your CIC on the blockchain.
            </li>
          </ul>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={() => stepper.nextStep()}>Let's get started!</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
