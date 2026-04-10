import { AlertCircle, CheckIcon, Rocket, Trophy } from "lucide-react";
import { Loading } from "./loading";
import { Progress } from "./ui/progress";

interface StatusStep {
  message: string;
  status: "success" | "error" | "loading";
  error?: string;
  details?: string;
  address?: string;
}

interface StatusDisplayProps {
  title: string;
  steps: StatusStep[];
  expectedSteps?: number;
  successMessage?: string;
  addressLabel?: string;
}

function StatusDisplay({ 
  title, 
  steps, 
  expectedSteps, 
  successMessage = "Deployment completed successfully!",
  addressLabel = "Contract Address"
}: StatusDisplayProps) {
  const getProgressValue = () => {
    if (steps.length === 0) return 0;
    const totalSteps = expectedSteps || steps.length || 1;
    
    // Count completed steps (success) and in-progress steps (loading)
    const completedSteps = steps.filter(step => step.status === "success").length;
    const loadingSteps = steps.filter(step => step.status === "loading").length;
    
    // If we have a success step, it means we're done
    if (completedSteps > 0) return 100;
    
    // If we have loading steps, show progress based on how many steps we've started
    if (loadingSteps > 0) {
      return Math.min(((steps.length - 1) / totalSteps) * 100, 95); // Cap at 95% until success
    }
    
    return 0;
  };

  const hasError = steps.some((step) => step.status === "error");
  const isComplete = steps.some(
    (step) => step.status === "success" && step.address
  );
  const progressValue = getProgressValue();

  return (
    <div className="p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
          {hasError ? (
            <AlertCircle className="h-8 w-8 text-red-500" />
          ) : isComplete ? (
            <Trophy className="h-8 w-8 text-green-500" />
          ) : (
            <Rocket className="h-8 w-8 text-blue-500 animate-pulse" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-600 text-sm">
          {hasError
            ? "Something went wrong during deployment"
            : isComplete
            ? successMessage
            : "This may take a few minutes"}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {Math.round(progressValue)}%
          </span>
        </div>
        <Progress value={progressValue} className="h-2 bg-gray-200" />
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.length > 0 ? (
          steps.map((step, index) => (
            <StatusStep
              key={index}
              step={step}
              isLatest={index === steps.length - 1}
            />
          ))
        ) : (
          <div className="flex items-center justify-center py-8">
            <Loading />
          </div>
        )}
      </div>

      {/* Success Address Display */}
      {isComplete && steps.find((step) => step.address) && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckIcon className="h-5 w-5 text-green-500" />
            <span className="font-medium text-green-800">{addressLabel}</span>
          </div>
          <p className="text-sm text-green-700 font-mono break-all">
            {steps.find((step) => step.address)?.address}
          </p>
        </div>
      )}
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
  const getStatusIndicator = () => {
    if (step.status === "success") {
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
          <CheckIcon className="h-4 w-4 text-white" />
        </div>
      );
    } else if (step.status === "error") {
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500">
          <AlertCircle className="h-4 w-4 text-white" />
        </div>
      );
    } else if (step.status === "loading" && isLatest) {
      return (
        <div className="w-6 h-6 flex items-center justify-center">
          <Loading />
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
        </div>
      );
    }
  };

  return (
    <div
      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
        step.status === "success"
          ? "border-green-200 bg-green-50/50"
          : step.status === "error"
            ? "border-red-200 bg-red-50/50"
            : step.status === "loading" && isLatest
              ? "border-blue-300 bg-blue-50/50"
              : "border-gray-100 bg-gray-50/30"
      }`}
    >
      {getStatusIndicator()}

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            step.status === "success"
              ? "text-green-700"
              : step.status === "error"
                ? "text-red-700"
                : step.status === "loading" && isLatest
                  ? "text-blue-700"
                  : "text-gray-500"
          }`}
        >
          {step.message}
        </p>

        {step.status === "error" && step.error && (
          <p className="text-red-600 text-xs mt-1">{step.error}</p>
        )}

        {step.status === "success" && step.details && (
          <p className="text-green-600 text-xs mt-1">{step.details}</p>
        )}
      </div>
    </div>
  );
}

export default StatusDisplay;
