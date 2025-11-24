"use client";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { type ReportStatusEnum } from "~/server/enums";

interface ReportStatusActionsProps {
  status?: keyof typeof ReportStatusEnum;
  className?: string;
}
const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-orange-100 text-orange-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};
const statusTitles = {
  DRAFT: "Draft",
  SUBMITTED: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function ReportStatusBadge({
  status,
  className,
  children,
}: ReportStatusActionsProps & { children?: React.ReactNode }) {
  if (!status) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-3 py-1 font-medium rounded-full border-0 cursor-pointer hover:opacity-80 transition-opacity",
        statusColors[status],
        className
      )}
    >
      <ReportStatus status={status} />
      {children}
    </Badge>
  );
}

export function ReportStatus({
  status,
}: ReportStatusActionsProps & { children?: React.ReactNode }) {
  if (!status) return null;

  return statusTitles[status];
}
