import { type Metadata } from "next";
import { caller } from "~/server/api/routers/_app";
import DashboardPage from "./dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard for Sarafu Network",
};

export default async function Page() {
  const vouchers = await caller.voucher.list();
  return <DashboardPage vouchers={vouchers} />;
}
