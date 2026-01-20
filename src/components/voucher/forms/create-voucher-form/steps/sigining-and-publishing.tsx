"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useWaitForTransactionReceipt } from "wagmi";
import { z } from "zod";
import StatusDisplay from "~/components/deploy-status";
import { CheckBoxField } from "~/components/forms/fields/checkbox-field";
import { buttonVariants } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { VoucherDeclaration } from "~/components/voucher/voucher-declaration";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { type RouterOutput } from "~/server/api/root";
import { type InferAsyncGenerator } from "~/server/api/routers/pool";
import { VoucherType } from "~/server/enums";
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
  const utils = trpc.useUtils();
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
  const [pendingTx, setPendingTx] = useState<{
    address: `0x${string}`;
    txHash: `0x${string}`;
  } | null>(null);

  // Wait for transaction confirmation on-chain
  const { isSuccess: txConfirmed, isLoading: txWaiting } =
    useWaitForTransactionReceipt({
      hash: pendingTx?.txHash,
      confirmations: 1,
    });

  // Redirect when transaction is confirmed
  useEffect(() => {
    if (txConfirmed && pendingTx?.address) {
      void utils.voucher.list.invalidate();
      router.push(`/vouchers/${pendingTx.address}`);
    }
  }, [txConfirmed, pendingTx?.address, utils.voucher.list, router]);

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

      if (state.status === "success" && state.address && state.txHash) {
        // Set pending tx - the useEffect will handle redirect after confirmation
        setPendingTx({
          address: state.address,
          txHash: state.txHash,
        });

        setStatus((s) => [
          ...s,
          {
            message: "Waiting for blockchain confirmation...",
            status: "loading",
          },
        ]);
        break;
      }

      // Fallback: if no txHash is available, redirect immediately (old behavior)
      if (state.status === "success" && state.address && !state.txHash) {
        await utils.voucher.list.invalidate();
        router.push(`/vouchers/${state.address}`);
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
              data.expiration.type === VoucherType.DEMURRAGE
                ? {
                    communityFund: data.expiration.communityFund,
                    period: data.expiration.period,
                    rate: data.expiration.rate,
                    supply: data.valueAndSupply.supply,
                    symbol: data.nameAndProducts.symbol,
                    expires: undefined,
                  }
                : {
                    communityFund: "",
                    period: 0,
                    rate: 0,
                    supply: data.valueAndSupply.supply,
                    symbol: data.nameAndProducts.symbol,
                    expires:
                      data.expiration.type === "GIFTABLE_EXPIRING"
                        ? data.expiration.expirationDate
                        : undefined,
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
                        href="https://grassecon.org/pages/terms-and-conditions"
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
                  description="You allow your voucher to be traded and exchanged."
                />
              </div>
            </form>
          </Form>
        </div>
      ) : (
        <StatusDisplay
          title="Please wait while we deploy your Voucher"
          steps={status}
          expectedSteps={5}
        />
      )}
      <StepControls
        onNext={form.handleSubmit(handleDeploy, (e) => console.error(e))}
        disabled={
          !form.formState.isValid ||
          form.formState.isSubmitting ||
          txWaiting ||
          pendingTx !== null
        }
      />
    </div>
  );
};
