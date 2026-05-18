"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { VerifyPhoneDialog } from "~/components/dialogs/verify-phone-dialog";
import { useAuth } from "~/hooks/use-auth";
import { getPhoneCountry } from "~/utils/phone-number";

/**
 * Inline status row rendered beneath the profile's phone input. Only shows
 * anything for Kenyan numbers, since that's the only OTP corridor today.
 *
 * Reflects the *saved* phone on `auth.user.phone_number`, not the live form
 * input — so the indicator only flips once the user actually persists a change.
 */
export function PhoneVerificationStatus() {
  const auth = useAuth();
  const [open, setOpen] = useState(false);

  const saved = auth?.user?.phone_number ?? "";
  if (!saved) return null;
  if (getPhoneCountry(saved) !== "KE") return null;

  const verified = Boolean(auth?.user?.phone_verified_at);

  return (
    <>
      {verified ? (
        <p className="flex items-center gap-1.5 text-xs text-green-700">
          <CheckCircle2 className="size-3.5" />
          Verified for Add Funds
        </p>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs">
          <span className="flex items-center gap-1.5 text-amber-800">
            <AlertTriangle className="size-3.5" />
            Not verified for Add Funds
          </span>
          <button
            type="button"
            className="font-medium text-amber-900 underline-offset-4 hover:underline"
            onClick={() => setOpen(true)}
          >
            Verify
          </button>
        </div>
      )}
      <VerifyPhoneDialog
        open={open}
        onOpenChange={setOpen}
        initialPhone={saved}
      />
    </>
  );
}
