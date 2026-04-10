import { headers } from "next/headers";
import { ContentContainer } from "~/components/layout/content-container";
import CreateOfferVoucherWizard from "~/components/voucher/forms/create-offer-voucher-wizard";
import { getDefaultCurrencyForCountry } from "@sarafu/core/currencies";

export default async function CreateVoucherPage() {
  const h = await headers();
  const country = h.get("x-vercel-ip-country");
  const defaultCurrency = getDefaultCurrencyForCountry(country);
  return (
    <ContentContainer title="Create Your Offer & Voucher">
      <CreateOfferVoucherWizard defaultCurrency={defaultCurrency} />
    </ContentContainer>
  );
}
