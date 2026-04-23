import { type Metadata } from "next";
import { ContentContainer } from "~/components/layout/content-container";
import { VoucherListContainer } from "~/components/voucher/voucher-list-container";

export const metadata: Metadata = {
  title: "Vouchers - Sarafu Network",
  description: "Explore community asset vouchers on Sarafu Network",
  openGraph: {
    title: "Sarafu Network Vouchers",
    description: "Explore community asset vouchers on Sarafu Network",
  },
};

export default function VouchersPage() {
  return (
    <ContentContainer title="Vouchers" className="bg-transparent">
      <h1 className="flex items-center gap-2 text-5xl font-bold ml-4 my-2">
        Vouchers
      </h1>
      <VoucherListContainer />
    </ContentContainer>
  );
}
