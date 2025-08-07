import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { type Metadata } from "next";
import { ContentContainer } from "~/components/layout/content-container";
import { PoolListContainer } from "~/components/pools/pools-page";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pools" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
  };
}

function PoolsPageContent() {
  const t = useTranslations("pools");
  
  return (
    <ContentContainer title={t("title")}>
      <div className="mx-auto max-w-7xl">
        <PoolListContainer />
      </div>
    </ContentContainer>
  );
}

export default function PoolsPage() {
  return <PoolsPageContent />;
}
