import { ContentContainer } from "~/components/layout/content-container";
import CreateOfferVoucherWizard from "~/components/voucher/forms/create-offer-voucher-wizard";

export default function CreateVoucherPage() {
  return (
    <ContentContainer title="Create Your Offer & Voucher">
      <CreateOfferVoucherWizard />
    </ContentContainer>
  );
}
