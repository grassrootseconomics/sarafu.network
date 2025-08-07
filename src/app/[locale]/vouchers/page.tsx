import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { type Metadata } from "next";
import { ContentContainer } from "~/components/layout/content-container";
import { VoucherListContainer } from "~/components/voucher/voucher-list-container";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "vouchers" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
  };
}

function VouchersPageContent() {
  const t = useTranslations("vouchers");
  
  return (
    <ContentContainer title={t("title")}>
      <div className="mx-auto max-w-7xl">
        <VoucherListContainer />
      </div>
    </ContentContainer>
  );
}

export default function VouchersPage() {
  return <VouchersPageContent />;
}