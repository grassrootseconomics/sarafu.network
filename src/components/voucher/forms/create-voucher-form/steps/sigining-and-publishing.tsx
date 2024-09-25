"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { CheckBoxField } from "~/components/forms/fields/checkbox-field";
import { Loading } from "~/components/loading";
import { buttonVariants } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { VoucherDeclaration } from "~/components/voucher/voucher-declaration";
import { useAuth } from "~/hooks/useAuth";
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
  const auth = useAuth();
  const { voucher, loading, info, onValid } = useVoucherDeploy();

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
        <VoucherDeclaration
          contract={
            data.expiration.type === "gradual"
              ? {
                  communityFund: data.expiration.communityFund,
                  period: data.expiration.period,
                  rate: data.expiration.rate,
                  supply: data.valueAndSupply.supply,
                  symbol: data.nameAndProducts.symbol,
                }
              : {
                  communityFund: "",
                  period: 0,
                  rate: 0,
                  supply: data.valueAndSupply.supply,
                  symbol: data.nameAndProducts.symbol,
                }
          }
          voucher={{
            created_at: new Date().toLocaleString(),
            voucher_description: data.nameAndProducts.description,
            voucher_email: data.aboutYou.email,
            voucher_website: data.aboutYou.website,
            voucher_value: data.valueAndSupply.value,
            voucher_name: data.nameAndProducts.name,
            voucher_type: data.expiration.type,
            voucher_uoa: data.valueAndSupply.uoa,
          }}
          issuer={{
            address: auth!.session!.address,
            name: data.aboutYou.name,
            type: "individual",
          }}
          products={data.nameAndProducts.products}
        />
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
