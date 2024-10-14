import { AlertCircle, CheckIcon } from "lucide-react";
import { Loading } from "./loading";

interface StatusStep {
  message: string;
  status: "success" | "error" | "loading";
  error?: string;
  details?: string;
}

interface StatusDisplayProps {
  title: string;
  steps: StatusStep[];
}

function StatusDisplay({ title, steps }: StatusDisplayProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">{title}</h1>
      <div className="space-y-1">
        {steps.length > 0 ? (
          steps.map((step, index) => (
            <StatusStep
              key={index}
              step={step}
              isLatest={index === steps.length - 1}
            />
          ))
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
}

function StatusStep({
  step,
  isLatest,
}: {
  step: StatusStep;
  isLatest: boolean;
}) {
  const statusIcons = {
    success: <CheckIcon className="h-6 w-6 text-green-500" />,
    error: <AlertCircle className="h-6 w-6 text-red-500" />,
    loading: isLatest ? <Loading /> : null,
  };

  return (
    <div
      className={`px-4 py-0 rounded-lg flex items-center space-x-4 transition-opacity duration-500 ease-in-out transform-gpu ${
        !isLatest ? "opacity-30" : ""
      }`}
      style={{ animation: "fadeIn 0.5s" }}
    >
      {statusIcons[step.status]}
      <div>
        <p className="font-medium">{step.message}</p>
        {step.status === "error" && (
          <p className="text-red-500">{step.error}</p>
        )}
        {step.status === "success" && step.details && (
          <p className="text-green-500">{step.details}</p>
        )}
      </div>
    </div>
  );
}

export default StatusDisplay;
