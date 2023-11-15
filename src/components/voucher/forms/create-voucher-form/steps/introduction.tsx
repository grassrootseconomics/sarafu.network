import { CollapsibleAlert } from "~/components/alert";
import { Button } from "~/components/ui/button";
import { useUser } from "~/hooks/useAuth";
import { useVoucherStepper } from "../provider";

export const IntroductionStep = () => {
  const stepper = useVoucherStepper();
  const user = useUser();
  return (
    <div className="w-full rounded-lg p-4 text-left">
      <CollapsibleAlert
        title="What is a CAV?"
        variant="info"
        message={
          <>
            <p>
              The essence of a CAV is to develop a contractual promise that can
              be offered and exchanged.
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
      <br />
      <p>
        Community Asset Vouchers (CAVs) are tradable offers for goods or
        services on a public decentralized ledger called Celo. This guide will
        help you design and publish a CAV. Here&apos;s the process for creating
        a CAV:
      </p>
      <br />

      <ol>
        <li>
          <strong>About you</strong>: Who&apos;s the Issuer creating and
          publishing the CAV?
        </li>
        <li>
          <strong>Naming & Purpose</strong>: What&apos;s your CAV&apos;s name
          and what can it be redeemed for?
        </li>
        <li>
          <strong>Valuation & Amount</strong>: How many CAVs will you create and
          what&apos;s their total worth?
        </li>
        <li>
          <strong>Expiry</strong>: When do CAVs expire, and where are they
          renewed?
        </li>
        <li>
          <strong>Customization</strong>: Any special features for your CAV?
        </li>
        <li>
          <strong>Finalization</strong>: Here, you&apos;ll sign and publish your
          CAV on the Celo ledger.
        </li>
      </ol>
      <br />
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
              your voucher on the CELO ledger, which is public, and all
              transactions and usage of your CAV will be transparent to the
              public. All information you enter on this website/tool should be
              considered public. Do not enter private or confidential
              information. Only enter information that is crucial for people to
              know about your CAV and how to contact you.
            </p>
            <p>
              Please check within your legal jurisdiction for local regulations.
              CAVs are only guaranteed to be accepted by the issuer (you or your
              association) and may not be accepted by other businesses or
              individuals.
            </p>
          </>
        }
      />
      <br />

      <div className="p-2 flex items-center justify-center">
        <Button
          onClick={() => {
            window.scrollTo(0, 0);
            stepper.nextStep();
          }}
          disabled={!user}
        >
          {user ? `Let's get started!` : `Connect your Wallet`}
        </Button>
      </div>
    </div>
  );
};
