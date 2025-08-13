"use client";
import { Suspense } from "react";
import { ContentContainer } from "~/components/layout/content-container";
import { InfinityLoader } from "~/components/loading";
import { DashboardTabs } from "./dashboard-tabs";

const DashboardPage = () => {
  return (
    <ContentContainer title="Dashboard" className="bg-transparent">
      <Suspense fallback={<InfinityLoader />}>
        <DashboardTabs />
      </Suspense>
    </ContentContainer>
  );
};

export default DashboardPage;
