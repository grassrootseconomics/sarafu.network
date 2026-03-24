"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useWaitForTransactionReceipt } from "wagmi";
import StatusDisplay from "~/components/deploy-status";
import { CheckBoxField } from "~/components/forms/fields/checkbox-field";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { useAuth } from "~/hooks/use-auth";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { type RouterOutput } from "~/server/api/root";
import { type InferAsyncGenerator } from "~/server/api/routers/pool";
import { useOfferVoucherData, useOfferVoucherDeploy } from "../provider";
import { type OfferVoucherWizardData } from "../schemas";
import { confirmSchema, type ConfirmFormValues } from "../schemas/confirm";
import { offerSchema } from "../schemas/offer";
import { pricingSchema } from "../schemas/pricing";
import { voucherStepSchema } from "../schemas/voucher";
import { transformToDeployInput } from "../transform";
import {
  validateWizardSteps,
  type StepValidationResult,
} from "../validation";

interface Step4Props {
  onBack?: () => void;
  setStep?: (step: number) => void;
}

function StepErrorsList({
  errors,
  setStep,
}: {
  errors: StepValidationResult[];
  setStep?: (step: number) => void;
}) {
  const invalidSteps = errors.filter((r) => !r.isValid);
  if (invalidSteps.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>Some steps need your attention</AlertTitle>
      <AlertDescription className="mt-3 space-y-3">
        {invalidSteps.map((step) => (
          <div key={step.step} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                Step {step.step + 1}: {step.label}
              </p>
              <ul className="text-xs mt-1 space-y-0.5 list-disc list-inside text-destructive-foreground/80">
                {step.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
            {setStep && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => setStep(step.step)}
              >
                Go to Step {step.step + 1}
                <ArrowRight className="ml-1 size-3" />
              </Button>
            )}
          </div>
        ))}
      </AlertDescription>
    </Alert>
  );
}

export function Step4Confirm({ onBack, setStep }: Step4Props) {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const wizardData = useOfferVoucherData();
  const { setDeployResult } = useOfferVoucherDeploy();

  const { mutateAsync: deploy } = trpc.voucher.deploy.useMutation({
    trpc: { context: { stream: true } },
  });

  const [status, setStatus] = useState<
    InferAsyncGenerator<RouterOutput["voucher"]["deploy"]>[]
  >([]);
  const [pendingTx, setPendingTx] = useState<{
    address: `0x${string}`;
    txHash: `0x${string}`;
  } | null>(null);
  const [deployErrors, setDeployErrors] = useState<
    StepValidationResult[] | null
  >(null);

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: pendingTx?.txHash,
    confirmations: 1,
  });

  // Pre-check: validate all prior steps
  const preCheckResults = useMemo(
    () => validateWizardSteps(wizardData),
    [wizardData]
  );
  const hasPreCheckErrors = preCheckResults.some((r) => !r.isValid);

  // On tx confirmation, set deploy result
  useEffect(() => {
    if (txConfirmed && pendingTx?.address) {
      void utils.voucher.list.invalidate();
      setDeployResult({
        address: pendingTx.address,
        txHash: pendingTx.txHash,
        voucherName: wizardData.voucher?.name ?? "",
        offerName: wizardData.offer?.name ?? "",
        currency:
          wizardData.voucher?.uoa ?? wizardData.pricing?.currency ?? "",
      });
    }
  }, [
    txConfirmed,
    pendingTx?.address,
    pendingTx?.txHash,
    utils.voucher.list,
    setDeployResult,
    wizardData.voucher?.name,
    wizardData.offer?.name,
    wizardData.voucher?.uoa,
    wizardData.pricing?.currency,
  ]);

  const form = useForm<ConfirmFormValues>({
    resolver: zodResolver(confirmSchema),
    mode: "onChange",
    defaultValues: {
      termsAndConditions: false,
      pathLicense: false,
    },
  });

  const isDeploying =
    form.formState.isSubmitting || status.length > 0 || pendingTx !== null;

  const handleDeploy = async (confirmData: ConfirmFormValues) => {
    if (!auth?.user) {
      toast.error("You must be logged in");
      return;
    }
    setDeployErrors(null);
    setStatus([]);

    // Validate each step using wizard schemas
    const offerResult = offerSchema.safeParse(wizardData.offer);
    const pricingResult = pricingSchema.safeParse(wizardData.pricing);
    const voucherResult = await voucherStepSchema.safeParseAsync(
      wizardData.voucher
    );
    const confirmResult = confirmSchema.safeParse(confirmData);

    const stepResults: StepValidationResult[] = [
      {
        step: 0,
        label: "Create Your Offer",
        isValid: offerResult.success,
        errors: offerResult.success
          ? []
          : offerResult.error.issues.map((i) => i.message),
      },
      {
        step: 1,
        label: "Price Your Offer",
        isValid: pricingResult.success,
        errors: pricingResult.success
          ? []
          : pricingResult.error.issues.map((i) => i.message),
      },
      {
        step: 2,
        label: "Your Voucher",
        isValid: voucherResult.success,
        errors: voucherResult.success
          ? []
          : voucherResult.error.issues.map((i) => i.message),
      },
      {
        step: 3,
        label: "Confirm & Publish",
        isValid: confirmResult.success,
        errors: confirmResult.success
          ? []
          : confirmResult.error.issues.map((i) => i.message),
      },
    ];

    const hasErrors = stepResults.some((r) => !r.isValid);
    if (hasErrors) {
      setDeployErrors(stepResults);
      return;
    }

    const fullData: OfferVoucherWizardData = {
      offer: offerResult.data!,
      pricing: pricingResult.data!,
      voucher: voucherResult.data!,
      confirm: confirmResult.data!,
    };

    const deployInput = transformToDeployInput(fullData, auth.user);

    try {
      const generator = await deploy(deployInput);
      for await (const state of generator) {
        setStatus((s) => [...s, state]);

        if (state.status === "success" && state.address && state.txHash) {
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

        // Fallback: no txHash
        if (state.status === "success" && state.address && !state.txHash) {
          await utils.voucher.list.invalidate();
          setDeployResult({
            address: state.address,
            voucherName: fullData.voucher.name,
            offerName: fullData.offer.name,
            currency: fullData.voucher.uoa,
          });
          break;
        }

        if (state.status === "error") {
          toast.error(state?.error ?? "An error occurred");
          break;
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Deployment failed"
      );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Confirm & Publish
        </h2>
        <p className="text-muted-foreground mt-1">
          Review your voucher, then publish it to the network.
        </p>
      </div>

      {/* Pre-check errors: block the form if prior steps are invalid */}
      {hasPreCheckErrors && !isDeploying && (
        <StepErrorsList errors={preCheckResults} setStep={setStep} />
      )}

      {/* Deploy validation errors (shown after clicking Create) */}
      {deployErrors && !isDeploying && (
        <StepErrorsList errors={deployErrors} setStep={setStep} />
      )}

      {!isDeploying ? (
        <>
          {/* Summary Card */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Voucher name
                </span>
                <span className="font-medium">
                  {wizardData.voucher?.name ?? "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Accepts</span>
                <span className="font-medium">
                  {wizardData.voucher?.uoa ??
                    wizardData.pricing?.currency ??
                    "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  First offer
                </span>
                <span className="font-medium">
                  {wizardData.offer?.name ?? "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Consent */}
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleDeploy, (e) =>
                    console.error(e)
                  )}
                  className="space-y-4"
                >
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
                          PATH License
                        </Link>
                      </>
                    }
                    description="You allow your voucher to be traded and exchanged."
                  />

                  <div className="flex items-center justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onBack}
                      disabled={!onBack}
                    >
                      <ArrowLeft className="mr-2 size-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!form.formState.isValid || hasPreCheckErrors}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Create My Voucher!
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </>
      ) : (
        <StatusDisplay
          title="Publishing your voucher..."
          steps={status}
          expectedSteps={5}
        />
      )}
    </div>
  );
}
