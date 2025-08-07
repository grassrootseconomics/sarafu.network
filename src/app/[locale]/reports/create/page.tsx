import { type Metadata } from "next";
import { ContentContainer } from "~/components/layout/content-container";
import { ReportForm } from "~/components/reports/forms/report-form";
import { auth } from "~/server/api/auth";
export const metadata: Metadata = {
  title: "Create Your Own Report",
  description: "Create your own report on the network.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
export default async function CreateReportPage() {
  const session = await auth();
  return (
    <ContentContainer>
      {session?.user ? (
        <>
          <h1 className="text-2xl font-bold my-4">Create Report</h1>
          <ReportForm />
        </>
      ) : (
        <div>Please login to create a report</div>
      )}
    </ContentContainer>
  );
}
