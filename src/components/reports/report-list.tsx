"use client";

import { trpc } from "~/lib/trpc";
import { type RouterInput } from "~/server/api/root";
import { ReportListItem } from "./report-list-item";

interface ReportListProps {
  query: RouterInput["report"]["list"];
}

export function ReportList({ query }: ReportListProps) {
  const reports = trpc.report.list.useQuery(query);
  return (
    <div className="flex flex-col gap-4">
      {reports.data?.map((report) => (
        <ReportListItem key={report.id} report={report} />
      ))}
    </div>
  );
}
