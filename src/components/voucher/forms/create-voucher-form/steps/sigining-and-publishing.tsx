import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { Alert } from "~/components/alert";
import { CheckBoxField } from "~/components/forms/fields/checkbox-field";
import { Loading } from "~/components/loading";
import { buttonVariants } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { Row } from "~/components/voucher/voucher-info";
import { useUser } from "~/hooks/useAuth";
import { cn } from "~/lib/utils";
import { StepControls } from "../controls";
import { useVoucherData, useVoucherDeploy } from "../provider";
import { type VoucherPublishingSchema } from "../schemas";
import {
  signingAndPublishingSchema,
  type SigningAndPublishingFormValues,
} from "../schemas/sigining-and-publishing";
import { redistributionPeriods } from "./expiration";

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
  if (voucher && !loading) {
    void router.push(`/vouchers/${voucher.voucher_address}`);
  }
  if (loading || voucher) {
    return <Loading status={info} />;
  }
  return (
    <div>
      <div>
        <div className="font-light">
          <h1 className="text-3xl font-bold mb-4">
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
          <div className="p-2 px-4 shadow-md m-2 break-all">
            <Row label="Name:" value={data.nameAndProducts.name} />
            <Row
              label="Description:"
              value={data.nameAndProducts.description}
            />
            <Row label="Symbol:" value={data.nameAndProducts.symbol} />
            <Row
              label="Supply"
              value={`${data.valueAndSupply.supply} ${data.nameAndProducts.symbol}`}
            />

            <Row
              label="Unit of Account and Denomination:"
              value={data.valueAndSupply.uoa}
            />
            <Row
              label="Value:"
              value={`1 ${data.nameAndProducts.symbol} is worth 
              ${data.valueAndSupply.value} ${data.valueAndSupply.uoa}
               of Goods and Services`}
            />
            <Row label="Contact Email:" value={data.aboutYou.email} />
            <Row label="Website:" value={data.aboutYou.website ?? ""} />
            <Row
              label="Issuer Account Address"
              value={
                data.options.transferAddress ??
                user?.account.blockchain_address ??
                ""
              }
            />
            {(data.expiration.type === "gradual" ||
              data.expiration.type === "both") && (
              <>
                <Row
                  label="Expiration Rate:"
                  value={`${data.expiration.rate}%`}
                />
                <Row
                  label="Redistribution Period:"
                  value={
                    redistributionPeriods.find(
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      (p) => p.value === data.expiration.period
                    )?.label ?? ""
                  }
                />
                <Row
                  label="Community Account for Expired CAVs:"
                  value={data.expiration.communityFund}
                />
              </>
            )}
          </div>
          <br />

          <Alert
            title="Total Value of CAVs"
            variant="info"
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
