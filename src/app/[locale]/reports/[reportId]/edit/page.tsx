// import { Icons } from "~/components/icons";
import { type Metadata } from "next";
import { ContentContainer } from "~/components/layout/content-container";
import { ReportForm } from "~/components/reports/forms/report-form";
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

  return (
    <ContentContainer>
      <Authorization resource="Reports" action="UPDATE" isOwner={isOwner}>
        <ReportForm report={report} />
      </Authorization>
    </ContentContainer>
  );
}
