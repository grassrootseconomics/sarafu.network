import { type Metadata } from "next";
import DashboardPage from "./dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard for Sarafu Network",
};

export default function Page() {
  return <DashboardPage />;
}
