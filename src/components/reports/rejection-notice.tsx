import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

interface RejectionNoticeProps {
  reason: string;
  variant?: "default" | "compact";
}

export function RejectionNotice({
  reason,
  variant = "default",
}: RejectionNoticeProps) {
  if (variant === "compact") {
    return (
      <Alert variant="destructive" className="border-l-4 border-l-red-600">
        <AlertCircle className="h-5 w-5" />
        <div>
          <AlertTitle>Report Rejected</AlertTitle>
          <AlertDescription className="mt-2 whitespace-pre-wrap">
            {reason}
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="border-l-4 border-l-red-600">
      <AlertCircle className="h-5 w-5" />
      <div>
        <AlertTitle>Report Rejected</AlertTitle>
        <AlertDescription className="mt-2 whitespace-pre-wrap">
          {reason}
        </AlertDescription>
      </div>
    </Alert>
  );
}
