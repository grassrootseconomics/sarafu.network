import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { ContentContainer } from "~/components/layout/content-container";
import VoucherStepper from "~/components/voucher/forms/create-voucher-form";

export default function StepperDemo() {
  return (
    <ContentContainer title="Create your own Voucher">
      <BreadcrumbResponsive
        items={[
          {
            label: "Home",
            href: "/",
          },
          { label: "Vouchers", href: "/vouchers" },
          {
            label: "Create",
          },
        ]}
      />
      <VoucherStepper />
    </ContentContainer>
  );
}
