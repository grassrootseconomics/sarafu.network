import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

interface RejectionNoticeProps {
  reason: string;
}

export function RejectionNotice({ reason }: RejectionNoticeProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Report Rejected</AlertTitle>
      <AlertDescription className="mt-2 whitespace-pre-wrap">
        {reason}
      </AlertDescription>
    </Alert>
  );
}
