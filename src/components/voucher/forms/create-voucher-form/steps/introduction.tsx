import { CollapsibleAlert } from "~/components/alert";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";
import { useVoucherStepper } from "../provider";

export const IntroductionStep = () => {
  const stepper = useVoucherStepper();
  const auth = useAuth();
  return (
    <div className="w-full rounded-lg p-6 text-left space-y-6">
      <h2 className="text-2xl font-bold mb-4">Welcome to CAV Creation</h2>
      <p className="text-lg">
        Community Asset Vouchers (CAVs) are offers for goods or services on a public decentralized ledger called Celo. They are similar to loyalty points or gift cards. This guide will help you design and publish a CAV.
      </p>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Process Overview</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li><strong>About you</strong>: Who are you as the Issuer creating and publishing the CAV?</li>
          <li><strong>Naming & Purpose</strong>: What&apos;s your CAV&apos;s name and what can it be redeemed for?</li>
          <li><strong>Valuation & Amount</strong>: How many CAVs do you want to create and what&apos;s their total worth?</li>
          <li><strong>Expiry</strong>: Does your CAV expire over time and where are they renewed?</li>
          <li><strong>Customization</strong>: Any special features for your CAV?</li>
          <li><strong>Finalization</strong>: Here, you&apos;ll sign and publish your CAV on the Celo ledger.</li>
        </ol>
      </div>

      <CollapsibleAlert
        title="What is a CAV?"
        variant="info"
        message={
          <>
            <p>
              The essence of a CAV is to develop a formal commitment or contractual promise that can be offered and exchanged.
            </p>
            <br />
            <p>
              {" "}
              <i>
                For example, if you create a CAV called COUCH, you could specify
                that 1 COUCH is redeemable as payment for 1 hour of your
                coaching. Another CAV called WAVE could be redeemable as payment
                for $10 USD worth of your vegetables.
              </i>
            </p>
            <br />
            <p>
              Some CAV issuers will sell their CAVs, while others will give them
              as gifts, loyalty points, or exchange them in-kind. Note that
              anyone holding your CAV has the right to trade them to someone
              else or redeem them as payment for your goods or services
              depending on how you design them in this guide.
            </p>
            <br />
            <p>
              The CAV&apos;s ultimate aim is community improvement. When
              planning it, listen to everyone who may be affected by it.
            </p>
          </>
        }
      />

      <CollapsibleAlert
        title="Disclaimer"
        variant="warning"
        message={
          <>
            <p>
              Sarafu.Network and Grassroots Economics Foundation are not giving
              financial advice, and there are no warranties implied. Use at your
              own risk.
            </p>
            <p>
              Grassroots Economics Foundation has no liability or obligation in
              relation to the usage or access to your CAV. You are publishing
              your voucher on the CELO ledger, which is public and all
              transactions and usage of your CAV will be transparent to the
              public. All information you enter on this website/tool should be
              considered public. Do not enter private or confidential
              information. Only enter information that is crucial for people to
              know about your CAV and how to contact you.
            </p>
            <p>
              Please check within your legal jurisdiction for local regulations.
              CAVs are only guaranteed to be accepted by the issuer (you or your
              association) and are not required to be accepted by other businesses or individuals.
            </p>
          </>
        }
      />

      <div className="flex justify-center mt-6">
        <Button
          onClick={() => {
            window.scrollTo(0, 0);
            stepper.nextStep();
          }}
          disabled={!auth?.user}
          size="lg"
        >
          {auth?.user ? `Let's get started!` : `Connect your Wallet`}
        </Button>
      </div>
    </div>
  );
};
