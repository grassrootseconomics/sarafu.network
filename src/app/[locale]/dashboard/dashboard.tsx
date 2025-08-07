"use client";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { ContentContainer } from "~/components/layout/content-container";
import { InfinityLoader } from "~/components/loading";
import { DashboardTabs } from "./dashboard-tabs";

const DashboardPage = () => {
  const t = useTranslations("dashboard");
  
  return (
    <ContentContainer title={t("title")}>
      <Suspense fallback={<InfinityLoader />}>
        <DashboardTabs />
      </Suspense>
    </ContentContainer>
  );
};

export default DashboardPage;
