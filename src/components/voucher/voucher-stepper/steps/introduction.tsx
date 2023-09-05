import Image from "next/image";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Warning } from "~/components/warning";
import { useVoucherStepper } from "../provider";

export const IntroductionStep = () => {
  const stepper = useVoucherStepper();
  return (
    <div className="w-full rounded-lg p-4 text-left">
      <Card>
        <CardHeader>
          <CardTitle>Community Asset Vouchers (CVAs) Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <figure>
            <Image
              alt="Basket Image"
              width={500}
              height={500}
              src={"/voucher/basket.png"}
              className="mx-auto"
            />
            <figcaption className="text-sm text-gray-600 italic">
              An Economic Commons is an agreement between people that includes
              their values, aims, instruments (like a CVA voucher) as well as
              roles and responsibilities. Note that without an agreement a
              Voucher has no meaning and there are no clear obligations of
              issuers and rights of holders..
            </figcaption>
          </figure>
          <br />
          <p>
            Community Asset Vouchers (CVAs) are tradable vouchers, their rules
            set by the issuing party or parties on the Celo Blockchain. This
            guide will help you design and release your own CVA or one for an
            association you represent.
          </p>
          <p>
            The essence of a CVA is to offer a contractual promise, redeemable
            either by you or an association.
          </p>
          <p>
            The CVA&apos;s ultimate aim is community improvement. When planning
            it, listening to everyone and refining concepts are crucial. Setting
            a timeline and defining the CVA&apos;s application in projects is
            also vital. Think of this planning as creating a social enterprise
            business plan, but with community involvement.
          </p>
          <br />
          <p>Here&apos;s what we&apos;ll discuss:</p>
          <br />

          <ul>
            <li>
              <strong>Issuer Details</strong>: Who&apos;s creating the CVA?
            </li>
            <li>
              <strong>Naming & Purpose</strong>: What&apos;s your CVA&apos;s
              name and what can it be exchanged for?
            </li>
            <li>
              <strong>Valuation & Amount</strong>: How much is the CVA worth and
              in what terms (e.g., USD or Eggs)? How many CVAs will you produce
              and what&apos;s their total worth?
            </li>
            <li>
              <strong>Expiry</strong>: When do CVAs expire, and where are they
              renewed?
            </li>
            <li>
              <strong>Customization</strong>: Any special features for your CVA?
            </li>
            <li>
              <strong>Finalization</strong>: Here, you&apos;ll seal the deal and
              release your CVA on the blockchain.
            </li>
          </ul>
          <br />
          <Warning
            message={
              <>
                <p>
                  This walkthrough and lessons learned described here are based
                  on practical experience in villages in Kenya. This does not
                  constitute financial advice. Use at your own risk. Also note
                  that by issuing a voucher you are obligated to redeem the
                  voucher as specified in this process.
                </p>
                <p>
                  Grassroots Economics Foundation has no liability or obligation
                  toward the usage of access to your voucher. You are publishing
                  your voucher on the CELO blockchain which is public and all
                  transactions and usage of your voucher will be transparent to
                  the public. All information you enter on this website / tool
                  should be considered public. Do not enter private information.
                  This information is crucial for people to know necessary about
                  your CVA and how to contact you.
                </p>
                <p>
                  If you are considering issuing or using a voucher, it is
                  important to weigh the risks and benefits carefully. Here are
                  some additional things to keep in mind about vouchers:
                </p>
                <ul>
                  <li>
                    They are not necessarily regulated by all governments, which
                    means that there is no state guarantee of their safety or
                    stability. Please check within your jurisdiction the local
                    regulations.
                  </li>
                  <li>
                    They may only be accepted by the issuer (you or your
                    association) and may not be accepted by other businesses or
                    individuals.
                  </li>
                  <li>
                    They may be difficult to redeem for cash or other
                    currencies.
                  </li>
                </ul>
              </>
            }
          />
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={() => stepper.nextStep()}>
            Let&apos;s get started!
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
