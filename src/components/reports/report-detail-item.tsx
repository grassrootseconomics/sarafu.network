import { type RouterOutputs } from "~/lib/trpc";
import PlateEditor from "../plate/editor";
import { Authorization } from "~/hooks/useAuth";
import { EditReportButton } from "./edit-report-button";
import { auth } from "~/server/api/auth";

interface ReportDetailItemProps {
  report: RouterOutputs["report"]["findById"];
}

export async function ReportDetailItem({ report }: ReportDetailItemProps) {
  const session = await auth();
  return (
    <div className="p-0 md:p-6">
      <Authorization
        resource="Reports"
        action="UPDATE"
        isOwner={report.created_by === session?.user?.id}
      >
        <EditReportButton
          reportId={report.id}
          variant="outline"
          className="ml-auto"
        />
      </Authorization>
      <PlateEditor disabled={true} initialValue={report.report} />
    </div>
  );
}
