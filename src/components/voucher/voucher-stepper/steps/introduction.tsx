import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Warning } from "~/components/warning";
import { useUser } from "~/hooks/useAuth";
import { useVoucherStepper } from "../provider";

export const IntroductionStep = () => {
  const stepper = useVoucherStepper();
  const user = useUser();
  return (
    <div className="w-full rounded-lg p-4 text-left">
      <figure>
        <Image
          alt="Basket Image"
          width={500}
          height={500}
          src={"/voucher/basket.png"}
          className="mx-auto"
        />
        <figcaption className="text-sm text-gray-600 italic">
        Community Asset Vouchers (CAVs) are tradable vouchers on the Celo Blockchain. This guide will
        help you design and publish a CAV.
        </figcaption>
      </figure>
      <br />
      <p>
        The essence of a CAV is to offer a contractual promise. As you create a CAV say called HUGS you would say 1 HUG is redeemable as payment by either by you or an association you represent for 1 hour of coaching. Another CAV called WAVE could be redeemable as payment for $10 USD of your shops vegetables. Some people will sell their CAVs while others will give them as gifts or exchange them in-kind.
      </p>
      <p>
        The CAV&apos;s ultimate aim is community improvement. When planning it,
        listening to everyone that may be effected by it. 
      </p>
      <br />
      <p>Here&apos;s the process for creating a CAV:</p>
      <br />

      <ul>
        <li>
          <strong>About you: </strong>: Who&apos;s the Issuer creating and publishing the CAV?
        </li>
        <li>
          <strong>Naming & Purpose</strong>: What&apos;s your CAV&apos;s name
          and what can it be redeemed for?
        </li>
        <li>
          <strong>Valuation & Amount</strong>: How much is the CAV worth and in
          what terms (e.g., USD or Eggs)? How many CAVs will you produce and
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
          <strong>Finalization</strong>: Here, you&apos;ll sign and
          publish your CAV on the blockchain.
        </li>
      </ul>
      <br />
      <Warning
        message={
          <>
            <p>
              This guide and lessons learned described in our documentation here are based on
              practical experience in Kenya. This does not
              constitute financial advice and there are no warrneties implied. Use at your own risk. Also note that
              by issuing a voucher you are obligated to redeem the voucher as
              specified in this process.
            </p>
            <p>
              Grassroots Economics Foundation has no liability or obligation in relationship
              toward the usage or access to your voucher. You are publishing
              your voucher on the CELO blockchain which is public and all
              transactions and usage of your voucher will be transparent to the
              public. All information you enter on this website / tool should be
              considered public. Do not enter private or confidential information. Only enter information
              that is crucial for people to know about your CAV
              and how to contact you.
            </p>
            <p>
              If you are considering issuing or using a CAV, it is important
              to weigh the risks and benefits carefully. Here are some
              additional things to keep in mind about CAVs:
            </p>
            <ul>
              <li>
                Please check within your legal jurisdiction for local
                regulations.
              </li>
              <li>
                They are only guarenteed to be accepted by the issuer (you or your
                association) and may not be accepted by other businesses or
                individuals. 
              </li>
            </ul>
          </>
        }
      />
      <div className="p-2 flex items-center justify-center">
        <Button onClick={() => stepper.nextStep()} disabled={!user}>
          {user ? `Let's get started!` : `Connect your Wallet`}
        </Button>
      </div>
    </div>
  );
};
