import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { ContentLayout } from "~/components/layout/content-layout";
import VoucherStepper from "~/components/voucher/forms/create-voucher-form";

export default function StepperDemo() {
  return (
    <ContentLayout title="Create your own Voucher">
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
    </ContentLayout>
  );
}
