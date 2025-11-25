"use client";
import {
  CheckIcon,
  ChevronDownIcon,
  RefreshCwIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ResponsiveModal } from "~/components/responsive-modal";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Authorization } from "~/hooks/useAuth";
import { type RouterOutputs, trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { ReportStatusEnum } from "~/server/enums";
import { ReportStatusBadge } from "./report-status-badge";

interface ReportStatusActionsProps {
  report: RouterOutputs["report"]["findById"];
  isOwner: boolean;
  button?: React.ReactNode;
  onStatusChange?: (status: keyof typeof ReportStatusEnum) => void;
  isPending?: boolean;
}

export function ReportStatusMenu({
  report,
  isOwner,
  onStatusChange,
  isPending,
  button,
}: ReportStatusActionsProps & { children?: React.ReactNode }) {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const utils = trpc.useUtils();
  const router = useRouter();

  const updateStatus = trpc.report.updateStatus.useMutation({
    onSuccess: (data) => {
      onStatusChange?.(data.status as keyof typeof ReportStatusEnum);
      void utils.report.findById.invalidate({ id: report!.id });
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setIsStatusModalOpen(false);
      router.refresh();
    },
  });

  const deleteReport = trpc.report.delete.useMutation();
  if (!report) return null;

  const handleStatusChange = (
    status: keyof typeof ReportStatusEnum,
    reason?: string
  ) => {
    if (!report.id) return;

    updateStatus.mutate({
      id: report.id,
      status,
      rejectionReason: reason,
    });
  };

  const handleDelete = async () => {
    if (report.id) {
      await deleteReport.mutateAsync({ id: report.id });
      void utils.report.list.invalidate();
      router.push("/reports");
    }
  };
  const canSubmit =
    report.status === ReportStatusEnum.DRAFT ||
    report.status === ReportStatusEnum.REJECTED;
  const canApprove =
    report.status !== ReportStatusEnum.APPROVED &&
    report.status !== ReportStatusEnum.REJECTED;
  const canReject = report.status !== ReportStatusEnum.REJECTED;

  return (
    <>
      {/* Status Actions Modal */}
      <ResponsiveModal
        title="Change Report Status"
        description="Select an action to update the report status."
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        button={
          button ?? (
            <button>
              <ReportStatusBadge status={report.status} className="py-2 px-3">
                <ChevronDownIcon
                  className={cn(
                    "w-4 h-4 ml-1 inline-block transition-transform",
                    isStatusModalOpen ? "rotate-180" : "rotate-0"
                  )}
                />
              </ReportStatusBadge>
            </button>
          )
        }
      >
        <div className="flex flex-col gap-3 p-2">
          {canSubmit && (
            <Authorization resource="Reports" action="SUBMIT" isOwner={isOwner}>
              <Button
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleStatusChange(ReportStatusEnum.SUBMITTED)}
                disabled={isPending || updateStatus.isPending}
              >
                {report.status === ReportStatusEnum.REJECTED ? (
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                ) : (
                  <CheckIcon className="w-4 h-4 mr-2" />
                )}
                {report.status === ReportStatusEnum.REJECTED
                  ? "Resubmit"
                  : "Publish"}
              </Button>
            </Authorization>
          )}

          {canApprove && (
            <Authorization
              resource="Reports"
              action="APPROVE"
              isOwner={isOwner}
            >
              <Button
                className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleStatusChange(ReportStatusEnum.APPROVED)}
                disabled={isPending || updateStatus.isPending}
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </Authorization>
          )}
          {canReject && (
            <Authorization resource="Reports" action="REJECT" isOwner={isOwner}>
              <Button
                variant="outline"
                className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                onClick={() => {
                  setIsStatusModalOpen(false);
                  setIsRejectDialogOpen(true);
                }}
                disabled={isPending || updateStatus.isPending}
              >
                <XIcon className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </Authorization>
          )}
          <div className="flex justify-center gap-2 pt-2 border-t mt-2">
            <Authorization resource="Reports" action="DELETE" isOwner={isOwner}>
              <Button
                variant="ghost"
                className="shrink justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  setIsStatusModalOpen(false);
                  setIsDeleteDialogOpen(true);
                }}
                disabled={deleteReport.isPending}
              >
                <Trash2Icon className="w-4 h-4 mr-2" />
              </Button>
            </Authorization>
            <Button
              variant="ghost"
              className="w-full justify-center"
              onClick={() => setIsStatusModalOpen(false)}
              disabled={isPending || updateStatus.isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </ResponsiveModal>

      {/* Reject Dialog */}
      <ResponsiveModal
        title="Reject Report"
        description="Please provide a reason for rejecting this report."
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
      >
        <div className="p-2 space-y-4">
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="min-h-[100px]"
          />
          <div className="flex gap-2 justify-end">
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
                handleStatusChange(ReportStatusEnum.REJECTED, rejectionReason)
              }
            >
              Reject Report
            </Button>
          </div>
        </div>
      </ResponsiveModal>

      {/* Delete Dialog */}
      <ResponsiveModal
        title="Delete Report"
        description="Are you sure you want to delete this report? This action cannot be undone."
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <div className="flex gap-2 justify-end p-2">
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={deleteReport.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await handleDelete();
              setIsDeleteDialogOpen(false);
            }}
            disabled={deleteReport.isPending}
          >
            Delete Report
          </Button>
        </div>
      </ResponsiveModal>
    </>
  );
}
