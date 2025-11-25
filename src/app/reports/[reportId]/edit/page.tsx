// import { Icons } from "~/components/icons";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentContainer } from "~/components/layout/content-container";
import { ReportForm } from "~/components/reports/forms/report-form";
import { ReportStatusMenu } from "~/components/reports/report-status-menu";
import { Authorization } from "~/hooks/useAuth";
import { auth } from "~/server/api/auth";
import { caller } from "~/server/api/routers/_app";

type Props = {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const reportId = parseInt(params.reportId);
  const report = await caller.report.findById({ id: reportId });

  return {
    title: report?.title,
    description: report?.description,
    openGraph: {
      title: report?.title,
      description: report?.description,
      url: `https://sarafu.network/reports/${reportId}`,
      images: report?.image_url ? [report.image_url] : [],
    },
  };
}

export default async function ReportPage(props: Props) {
  const params = await props.params;
  const reportId = parseInt(params.reportId);
  const report = await caller.report.findById({ id: reportId });
  const session = await auth();
  const isOwner = session?.user?.id === report?.created_by;

  if (!report) {
    notFound();
  }

  return (
    <ContentContainer>
      <Authorization resource="Reports" action="UPDATE" isOwner={isOwner}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {/* Header with Status Badge */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Edit Report
              </h1>
              <ReportStatusMenu report={report} isOwner={isOwner} />
            </div>
            <p className="text-gray-600 text-sm">
              Make changes to your report and save when you&apos;re ready
            </p>
          </div>

          {/* Form */}
          <ReportForm report={report} />
        </div>
      </Authorization>
    </ContentContainer>
  );
}
