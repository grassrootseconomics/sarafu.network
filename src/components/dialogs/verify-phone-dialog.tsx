"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PhoneField } from "~/components/forms/fields/phone-field";
import { ResponsiveModal } from "~/components/responsive-modal";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { trpc } from "~/lib/trpc";
import {
  formatPhoneInternational,
  makePhoneNumberSchema,
} from "~/utils/phone-number";

const RESEND_COOLDOWN_SECONDS = 60;
const VERIFIED_DISPLAY_MS = 600;

const phoneSchema = z.object({
  phone: makePhoneNumberSchema("KE"),
});
type PhoneValues = z.infer<typeof phoneSchema>;

interface VerifyPhoneDialogProps {
  button?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onVerified?: (phone: string) => void;
  /** Pre-fill the phone field (e.g. when re-verifying a known saved number). */
  initialPhone?: string;
}

export function VerifyPhoneDialog({
  button,
  open: controlledOpen,
  onOpenChange,
  onVerified,
  initialPhone,
}: VerifyPhoneDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      button={button}
      title="Verify your phone number"
      description="We'll send a 6-digit code via SMS to confirm you own this number."
    >
      <VerifyFlow
        key={open ? "open" : "closed"}
        initialPhone={initialPhone}
        onVerified={(phone) => {
          setOpen(false);
          onVerified?.(phone);
        }}
      />
    </ResponsiveModal>
  );
}

function VerifyFlow({
  onVerified,
  initialPhone,
}: {
  onVerified: (phone: string) => void;
  initialPhone?: string;
}) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const requestMutation = trpc.otp.requestPhone.useMutation();
  const verifyMutation = trpc.otp.verifyPhone.useMutation();

  return (
    <div className="flex flex-col gap-4">
      {step === "phone" && (
        <PhoneSubmitStep
          submitting={requestMutation.isPending}
          errorMessage={phoneError}
          initialPhone={initialPhone}
          onSubmit={async (values) => {
            setPhoneError(null);
            try {
              await requestMutation.mutateAsync({ phone: values.phone });
              setPhone(values.phone);
              setStep("code");
            } catch (err) {
              setPhoneError(
                err instanceof Error ? err.message : "Could not send code"
              );
            }
          }}
        />
      )}

      {step === "code" && (
        <CodeStep
          phone={phone}
          submitting={verifyMutation.isPending}
          resending={requestMutation.isPending}
          onResend={async () => {
            await requestMutation.mutateAsync({ phone });
          }}
          onBack={() => {
            setPhoneError(null);
            setStep("phone");
          }}
          onSubmit={async (code) => {
            await verifyMutation.mutateAsync({ phone, code });
            // Server cache holds the AppSession; invalidate so the next
            // useAuth() reflects the new phone_verified_at.
            await utils.invalidate();
            // Brief on-screen confirmation before the dialog closes.
            await new Promise((r) => setTimeout(r, VERIFIED_DISPLAY_MS));
            onVerified(phone);
          }}
        />
      )}
    </div>
  );
}

function PhoneSubmitStep({
  submitting,
  errorMessage,
  initialPhone,
  onSubmit,
}: {
  submitting: boolean;
  errorMessage: string | null;
  initialPhone?: string;
  onSubmit: (values: PhoneValues) => Promise<void> | void;
}) {
  const form = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: initialPhone ?? "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <PhoneField
          form={form}
          name="phone"
          label="Phone number"
          description="Kenyan M-PESA number, including country code."
          lockCountry="KE"
        />
        {errorMessage ? (
          <p
            role="alert"
            className="flex items-start gap-2 text-sm text-destructive"
          >
            <AlertCircle className="size-4 shrink-0 mt-0.5" /> {errorMessage}
          </p>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" /> Sending…
            </>
          ) : (
            "Send code"
          )}
        </Button>
      </form>
    </Form>
  );
}

function CodeStep({
  phone,
  submitting,
  resending,
  onResend,
  onBack,
  onSubmit,
}: {
  phone: string;
  submitting: boolean;
  resending: boolean;
  onResend: () => Promise<void> | void;
  onBack: () => void;
  onSubmit: (code: string) => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  // The code we've already attempted/are attempting — used to block both the
  // duplicate auto-submit (when user re-enters the same 6 digits) and a stale
  // manual click after the server has consumed the OTP.
  const [attemptedCode, setAttemptedCode] = useState<string>("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const locked = submitting || verified;

  const submit = async (next: string) => {
    if (locked || next === attemptedCode) return;
    setAttemptedCode(next);
    setError(null);
    setResendNotice(null);
    try {
      await onSubmit(next);
      setVerified(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {verified ? (
        <CheckCircle2 className="size-10 text-green-600" />
      ) : (
        <ShieldCheck className="size-10 text-primary" />
      )}
      <div className="space-y-1">
        {verified ? (
          <p className="text-sm font-medium text-green-700">
            Phone verified — continuing…
          </p>
        ) : (
          <>
            <p className="text-sm">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium">
                {formatPhoneInternational(phone)}
              </span>
              .
            </p>
            <p className="text-xs text-muted-foreground">
              Codes expire in 10 minutes.
            </p>
          </>
        )}
      </div>
      <InputOTP
        maxLength={6}
        value={code}
        disabled={locked}
        onChange={(v) => {
          const digits = v.replace(/\D/g, "");
          setCode(digits);
          if (error) setError(null);
          if (resendNotice) setResendNotice(null);
          if (digits.length === 6) void submit(digits);
        }}
        autoFocus
      >
        <InputOTPGroup>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <div className="min-h-[1.25rem] text-xs">
        {error ? (
          <p
            role="alert"
            className="flex items-center gap-1.5 text-destructive"
          >
            <AlertCircle className="size-3.5" /> {error}
          </p>
        ) : resendNotice ? (
          <p className="text-muted-foreground">{resendNotice}</p>
        ) : null}
      </div>
      <Button
        type="button"
        disabled={code.length !== 6 || locked}
        onClick={() => void submit(code)}
        className="w-full"
      >
        {verified ? (
          <>
            <CheckCircle2 className="size-4 mr-2" /> Verified
          </>
        ) : submitting ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" /> Verifying…
          </>
        ) : (
          "Verify"
        )}
      </Button>
      <div className="flex w-full justify-between text-xs">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline disabled:cursor-not-allowed"
          onClick={onBack}
          disabled={locked}
        >
          Change number
        </button>
        <button
          type="button"
          className="text-primary disabled:text-muted-foreground disabled:cursor-not-allowed underline-offset-4 hover:underline"
          disabled={cooldown > 0 || resending || locked}
          onClick={async () => {
            try {
              await onResend();
              setResendNotice("New code sent.");
              setCooldown(RESEND_COOLDOWN_SECONDS);
              setAttemptedCode("");
              setCode("");
              setError(null);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not resend");
            }
          }}
        >
          {resending
            ? "Sending…"
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend code"}
        </button>
      </div>
    </div>
  );
}
