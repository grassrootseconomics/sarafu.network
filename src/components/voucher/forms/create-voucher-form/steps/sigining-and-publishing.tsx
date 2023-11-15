import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { WarningAlert } from "~/components/alert";
import { CheckBoxField } from "~/components/forms/fields/checkbox-field";
import { Loading } from "~/components/loading";
import { buttonVariants } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { useUser } from "~/hooks/useAuth";
import { cn } from "~/lib/utils";
import { StepControls } from "../controls";
import { useVoucherData, useVoucherDeploy } from "../provider";
import { type VoucherPublishingSchema } from "../schemas";
import {
  signingAndPublishingSchema,
  type SigningAndPublishingFormValues,
} from "../schemas/sigining-and-publishing";

// This can come from your database or API.
const defaultValues: Partial<SigningAndPublishingFormValues> = {};
export const ReviewStep = () => {
  const data = useVoucherData() as VoucherPublishingSchema;
  const router = useRouter();
  const user = useUser();
  const { voucher, loading, hash, info, receipt, onValid } = useVoucherDeploy();

  const form = useForm<SigningAndPublishingFormValues>({
    resolver: zodResolver(signingAndPublishingSchema),
    mode: "onChange",
    defaultValues: defaultValues,
  });
  if (voucher) {
    void router.push(`/vouchers/${voucher.voucher_address}`);
  }
  if (loading) {
    return <Loading status={info} />;
  } else if (receipt) {
    return (
      <div>
        <p>Transaction Hash: {hash}</p>
        <div>Contract Address: {receipt.contractAddress}</div>
      </div>
    );
  }
  return (
    <div>
      <div>
        <div className="font-light">
          <h1 className="text-4xl font-bold mb-4">
            Community Asset Voucher (CAV) Declaration
          </h1>
          <h2 className="text-2xl font-semibold mb-2">Preamble</h2>
          <p className="mb-4">
            I, <span className="font-semibold">{data.aboutYou.name}</span>,
            hereby agree to publish a Community Asset Voucher on the Celo ledger
            and do not hold Grassroots Economics Foundation liable for any
            damages and understand there is no warranty included or implied.
          </p>
          <h2 className="text-2xl font-semibold mb-2">CAV Info</h2>
          <p className="mb-2">
            Name:{" "}
            <span className="font-semibold">{data.nameAndProducts.name}</span>
          </p>
          <p className="mb-2">
            Description:{" "}
            <span className="font-semibold">
              {data.nameAndProducts.description}
            </span>
          </p>
          <p className="mb-2">
            Symbol:{" "}
            <span className="font-semibold">{data.nameAndProducts.symbol}</span>
          </p>
          <p className="mb-2">
            Supply:{" "}
            <span className="font-semibold">
              {data.valueAndSupply.supply} {data.nameAndProducts.symbol}
            </span>
          </p>
          <p className="mb-2">
            Unit of Account and Denomination:{" "}
            <span className="font-semibold">{data.valueAndSupply.uoa}</span>
          </p>
          <p className="mb-2">
            Value:{" "}
            <span className="font-semibold">
              1 {data.nameAndProducts.symbol} is worth{" "}
              {data.valueAndSupply.value} {data.valueAndSupply.uoa}
              {" of Goods and Services"}
            </span>
          </p>
          <p className="mb-2">
            Contact Email:{" "}
            <span className="font-semibold">{data.aboutYou.email}</span>
          </p>
          <p className="mb-2">
            Website:{" "}
            <span className="font-semibold">{data.aboutYou.website}</span>
          </p>
          <p className="mb-2">
            Issuer Account Address:{" "}
            <span className="font-semibold">
              {data.options.transferAddress ?? user?.account.blockchain_address}
            </span>
          </p>
          {(data.expiration.type === "gradual" ||
            data.expiration.type === "both") && (
            <>
              <p className="mb-2">
                Expiration Rate:{" "}
                <span className="font-semibold">{data.expiration.rate}%</span>
              </p>
              <p className="mb-2">
                Community Account for Expired CAVs:{" "}
                <span className="font-semibold">
                  {data.expiration.communityFund}
                </span>
              </p>
            </>
          )}
          <br />

          <WarningAlert
            message={`You will be creating an initial supply of ${
              data.valueAndSupply.supply
            } ${data.nameAndProducts?.symbol} - valued at ${
              data.valueAndSupply.supply * data.valueAndSupply.value
            } ${
              data.valueAndSupply.uoa
            }, this will be redeemable as payment for the following products:`}
          />
          <br />
          <p className="text-xl font-semibold mb-2">
            Product Offering and Value:
          </p>
          <div className="mb-2">
            {data.nameAndProducts.products &&
              data.nameAndProducts.products.map((product, index) => (
                <li key={index}>
                  <strong>{product.quantity}</strong>{" "}
                  <strong>{product.name}</strong> will be redeemable every
                  <strong> {product.frequency}</strong> using{" "}
                  {data.nameAndProducts.symbol}
                </li>
              ))}
          </div>
          <br />
          <h2 className="text-2xl font-semibold mb-2">Addendum</h2>
          <p className="mb-2">
            Good Faith: You the issuer of this CAV and any holders into this
            agreement in good faith and holds harmless other members of the
            Grassroots Economics Foundation
          </p>
          <p className="mb-2">
            Entirety: this agreement represents your consent (and or that of the
            association your are representing)
          </p>
          <br />
          <h2 className="text-2xl font-semibold mb-2">Official Signatories</h2>
          <p className="mb-2">
            Title:{" "}
            <span className="font-semibold">
              {data.aboutYou.type === "group" ? "Director" : "Individual"}
            </span>
          </p>
          <p className="mb-2">
            Full Name:{" "}
            <span className="font-semibold">{data.aboutYou.name}</span>
          </p>
          <p className="mb-2">
            Contact Address:{" "}
            <span className="font-semibold">{data.aboutYou.email}</span>
          </p>
          <p className="mb-2">
            Website:{" "}
            <span className="font-semibold">{data.aboutYou.website}</span>
          </p>
          <p className="mb-2">
            On behalf of:{" "}
            <span className="font-semibold">{data.aboutYou.name}</span>
          </p>

          <p className="mb-2">
            Date of Signing:{" "}
            <span className="font-semibold">
              {new Date().toLocaleDateString()}
            </span>
          </p>
        </div>
        <Form {...form}>
          <form>
            <div className="flex-col items-center justify-center mt-4">
              <CheckBoxField
                form={form}
                name="termsAndConditions"
                label={
                  <>
                    <span className="font-normal">Accept </span>
                    <Link
                      rel="noopener noreferrer"
                      target="_blank"
                      className={cn(
                        buttonVariants({ variant: "link", size: "xs" }),
                        "p-0"
                      )}
                      href="/terms-and-conditions"
                    >
                      Terms and Conditions
                    </Link>
                  </>
                }
                description="You agree to our Terms of Service and Privacy Policy"
              />
              <CheckBoxField
                form={form}
                name="pathLicense"
                label={
                  <>
                    <span className="font-normal">Accept </span>
                    <Link
                      rel="noopener noreferrer"
                      target="_blank"
                      className={cn(
                        buttonVariants({ variant: "link", size: "xs" }),
                        "p-0"
                      )}
                      href="https://docs.grassecon.org/commons/path/"
                    >
                      Public Awareness & Transparent Heritage (PATH) License
                    </Link>
                  </>
                }
                description="You allow your CAV to be freely traded/resold."
              />
            </div>
          </form>
        </Form>
      </div>
      <StepControls
        onNext={form.handleSubmit(onValid, (e) => console.error(e))}
      />
    </div>
  );
};
