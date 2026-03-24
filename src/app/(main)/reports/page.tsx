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
      <div className="py-6 md:py-6 max-w-6xl px-2">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
          Community Reports
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl ml-2">
          Explore verified updates from the Sarafu Network. Track progress, view locations, and stay informed about community activities.
        </p>
      </div>

      <Reports />
    </ContentContainer>
  );
}
