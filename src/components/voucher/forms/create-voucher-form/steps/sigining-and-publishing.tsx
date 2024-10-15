"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import StatusDisplay from "~/components/deploy-status";
import { CheckBoxField } from "~/components/forms/fields/checkbox-field";
import { buttonVariants } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { VoucherDeclaration } from "~/components/voucher/voucher-declaration";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { RouterOutput } from "~/server/api/root";
import { InferAsyncGenerator } from "~/server/api/routers/pool";
import { StepControls } from "../controls";
import { useVoucherData } from "../provider";
import { schemas, type VoucherPublishingSchema } from "../schemas";
import {
  signingAndPublishingSchema,
  type SigningAndPublishingFormValues,
} from "../schemas/sigining-and-publishing";

// This can come from your database or API.
const defaultValues: Partial<SigningAndPublishingFormValues> = {};
export const ReviewStep = () => {
  const router = useRouter();
  const data = useVoucherData() as VoucherPublishingSchema;
  const auth = useAuth();
  const { mutateAsync: deploy } = trpc.voucher.deploy.useMutation({
    trpc: {
      context: {
        // Use HTTP streaming for this request
        stream: true,
      },
    },
  });
  const [status, setStatus] = useState<
    InferAsyncGenerator<RouterOutput["voucher"]["deploy"]>[]
  >([]);
  const form = useForm<SigningAndPublishingFormValues>({
    resolver: zodResolver(signingAndPublishingSchema),
    mode: "onChange",
    defaultValues: defaultValues,
  });

  const handleDeploy = async (
    d: VoucherPublishingSchema["signingAndPublishing"]
  ) => {
    setStatus([]);

    const formData = { ...data, signingAndPublishing: d };
    const validation = await z.object(schemas).safeParseAsync(formData);
    if (!validation.success) {
      toast.error("Form validation failed");
      return;
    }
    const generator = await deploy(validation.data);
    for await (const state of generator) {
      setStatus((s) => [...s, state]);
      if (state.status === "success") {
        router.push(`/vouchers/${state.address}`);
        setStatus((s) => [
          ...s,
          {
            message: "Redirecting you to your voucher",
            status: "loading",
          },
        ]);
        break;
      }
      if (state.status === "error") {
        toast.error(state?.error ?? "An error occurred");
        break;
      }
    }
  };
  return (
    <div>
      {!form.formState.isSubmitting && status.length === 0 ? (
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
      ) : (
        <StatusDisplay
          title="Please wait while we deploy your Voucher"
          steps={status}
        />
      )}
      <StepControls
        onNext={form.handleSubmit(handleDeploy, (e) => console.error(e))}
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      />
    </div>
  );
};
