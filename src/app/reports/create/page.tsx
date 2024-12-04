import { type Metadata } from "next";
import { ContentContainer } from "~/components/layout/content-container";
import { ReportForm } from "~/components/reports/forms/report-form";
export const metadata: Metadata = {
  title: "Create Your Own Report",
  description: "Create your own report on the network.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
export default function CreateReportPage() {
  return (
    <ContentContainer title="Create Report">
      <h1 className="text-2xl font-bold my-4">Create Report</h1>
      <ReportForm />
    </ContentContainer>
  );
}
