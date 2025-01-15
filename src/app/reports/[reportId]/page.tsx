import type { Metadata } from "next";
import { ContentContainer } from "~/components/layout/content-container";
import { ReportDetailItem } from "~/components/reports/report-detail-item";
import { caller } from "~/server/api/routers/_app";

type Props = {
  params: { reportId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// Enable ISR with a revalidation period of 60 seconds
export const revalidate = 60;

// Instead of using generateStaticParams, we'll let Next.js handle dynamic routes
// and rely on ISR for caching

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const reportId = parseInt(params.reportId);
  const report = await caller.report.findById({ id: reportId });

  return {
    title: report.title,
    description: report.description ?? "",
    openGraph: {
      title: report.title,
      description: report.description ?? "",
      url: `https://sarafu.network/reports/${reportId}`,
      images: report.image_url ? [report.image_url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `Report: ${report.title}`,
      description: report.description ?? "",
      images: report.image_url ? [report.image_url] : [],
    },
  };
}

export default async function ReportPage({ params }: Props) {
  const reportId = parseInt(params.reportId);
  const report = await caller.report.findById({ id: reportId });

  return (
    <ContentContainer title={""}>
      <ReportDetailItem report={report} />
    </ContentContainer>
  );
}
