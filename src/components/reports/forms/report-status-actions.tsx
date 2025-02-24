import { useState } from "react";
import AreYouSureDialog from "~/components/dialogs/are-you-sure";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Authorization } from "~/hooks/useAuth";
import { type RouterOutputs, trpc } from "~/lib/trpc";
import { ReportStatus } from "~/server/enums";

interface ReportStatusActionsProps {
  report?: RouterOutputs["report"]["findById"];
  isOwner: boolean;
  onDelete?: () => void;
  isPending?: boolean;
}

export function ReportStatusActions({
  report,
  isOwner,
  onDelete,
  isPending,
}: ReportStatusActionsProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const utils = trpc.useUtils();

  const updateStatus = trpc.report.updateStatus.useMutation({
    onSuccess: () => {
      void utils.report.findById.invalidate({ id: report?.id ?? 0 });
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    },
  });

  if (!report) return null;

  const handleStatusChange = (
    status: keyof typeof ReportStatus,
    reason?: string
  ) => {
    if (!report?.id) return;

    updateStatus.mutate({
      id: report.id,
      status,
      rejectionReason: reason,
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {(report.status === ReportStatus.DRAFT ||
          report.status === ReportStatus.REJECTED) && (
          <Authorization resource="Reports" action="SUBMIT" isOwner={isOwner}>
            <Button
              type="button"
              variant="outline"
              disabled={isPending || updateStatus.isPending}
              onClick={() => handleStatusChange(ReportStatus.SUBMITTED)}
              className="flex-1 min-w-[120px]"
            >
              {report.status === ReportStatus.REJECTED ? "Resubmit" : "Publish"}
            </Button>
          </Authorization>
        )}

        {(report.status === ReportStatus.SUBMITTED ||
          report.status === ReportStatus.DRAFT) && (
          <Authorization resource="Reports" action="APPROVE" isOwner={isOwner}>
            <div className="flex gap-2 flex-1 min-w-[240px]">
              <Button
                type="button"
                variant="default"
                disabled={isPending || updateStatus.isPending}
                onClick={() => handleStatusChange(ReportStatus.APPROVED)}
                className="flex-1"
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={isPending || updateStatus.isPending}
                onClick={() => setIsRejectDialogOpen(true)}
                className="flex-1"
              >
                Reject
              </Button>
            </div>
          </Authorization>
        )}

        <Authorization resource="Reports" action="DELETE" isOwner={isOwner}>
          <AreYouSureDialog
            title="Delete Report"
            description="Are you sure you want to delete this report?"
            onYes={() => onDelete?.()}
          />
        </Authorization>
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Report</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this report.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={updateStatus.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectionReason.trim() || updateStatus.isPending}
              onClick={() =>
                handleStatusChange(ReportStatus.REJECTED, rejectionReason)
              }
            >
              Reject Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
