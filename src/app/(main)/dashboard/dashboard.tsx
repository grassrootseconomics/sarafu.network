"use client";
import { Suspense } from "react";
import { ContentContainer } from "~/components/layout/content-container";
import { InfinityLoader } from "~/components/loading";
import { DashboardTabs } from "./dashboard-tabs";

const DashboardPage = () => {
  return (
    <ContentContainer title="Dashboard" className="bg-transparent">
      <h1 className="text-5xl font-bold ml-4 my-2">Dashboard</h1>
      <Suspense fallback={<InfinityLoader />}>
        <DashboardTabs />
      </Suspense>
    </ContentContainer>
  );
};

export default DashboardPage;
