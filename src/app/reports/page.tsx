import { type Metadata } from "next";
import { ContentContainer } from "~/components/layout/content-container";
import { Reports } from "~/components/reports/reports";
export const metadata: Metadata = {
  title: "Create Your Own Report",
  description: "Create your own report on the network.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
export default function ReportsPage() {
  return (
    <ContentContainer>
      <h1 className="text-5xl font-bold ml-4 my-2">Reports</h1>

      <Reports />
    </ContentContainer>
  );
}
