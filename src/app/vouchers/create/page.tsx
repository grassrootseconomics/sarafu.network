import { ContentContainer } from "~/components/layout/content-container";
import VoucherStepper from "~/components/voucher/forms/create-voucher-form";

export default function StepperDemo() {
  return (
    <ContentContainer title="Create your own Voucher">
      <VoucherStepper />
    </ContentContainer>
  );
}
