"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { CollapsibleAlert } from "~/components/alert";
import { ConnectButton } from "~/components/buttons/connect-button";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";
import { useVoucherStepper } from "../provider";

export const IntroductionStep = () => {
  const t = useTranslations("voucherCreation.introduction");
  const stepper = useVoucherStepper();
  const auth = useAuth();
  return (
    <div className="w-full rounded-lg text-left space-y-6">
      <h2 className="text-2xl font-bold mb-4">{t("welcomeTitle")}</h2>
      <p className="text-lg">{t("cavDescription")}</p>

      <div className="bg-gray-50 outline p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">{t("processOverview")}</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>{t("steps.aboutYou.title")}</strong>:{" "}
            {t("steps.aboutYou.description")}
          </li>
          <li>
            <strong>{t("steps.naming.title")}</strong>:{" "}
            {t("steps.naming.description")}
          </li>
          <li>
            <strong>{t("steps.valuation.title")}</strong>:{" "}
            {t("steps.valuation.description")}
          </li>
          <li>
            <strong>{t("steps.expiry.title")}</strong>:{" "}
            {t("steps.expiry.description")}
          </li>
          <li>
            <strong>{t("steps.finalization.title")}</strong>:{" "}
            {t("steps.finalization.description")}
          </li>
        </ol>
      </div>

      <CollapsibleAlert
        title={t("whatIsCAV.title")}
        variant="info"
        message={
          <>
            <div
              dangerouslySetInnerHTML={{
                __html: t.raw("whatIsCAV.content") as TrustedHTML,
              }}
            />
          </>
        }
      />

      <CollapsibleAlert
        title={t("disclaimer.title")}
        variant="warning"
        message={
          <>
            <div
              dangerouslySetInnerHTML={{
                __html: t.raw("disclaimer.content") as TrustedHTML,
              }}
            />
          </>
        }
      />

      <div className="flex justify-center pb-6">
        {!auth?.user ? (
          <ConnectButton />
        ) : (
          <Button
            onClick={() => {
              window.scrollTo(0, 0);
              stepper.nextStep();
            }}
            className="px-4"
            size="lg"
          >
            {t("getStarted")}
            <ArrowRight size={16} className="ml-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
