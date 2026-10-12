import { type Metadata } from "next";
import { CreationDisabledPage } from "~/components/migration/creation-disabled-page";

export const metadata: Metadata = {
  title: "Create Report - Sarafu Network",
  description: "New reports have moved to Cosmo-Local Credit.",
};

export default function CreateReportPage() {
  return <CreationDisabledPage resource="report" fallbackHref="/reports" />;
}
