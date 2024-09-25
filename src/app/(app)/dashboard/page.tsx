import { type Metadata } from "next";
import DashboardPage from "./dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Page() {
  return <DashboardPage />;
}
