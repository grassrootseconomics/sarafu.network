import {
  AlertCircle,
  CheckIcon,
  Clock,
  Database,
  Rocket,
  Trophy,
} from "lucide-react";
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
              stepNumber={index + 1}
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
  stepNumber: _stepNumber,
  isLatest,
}: {
  step: StatusStep;
  stepNumber: number;
  isLatest: boolean;
}) {
  const getStepIcon = () => {
    if (step.status === "success") {
      return <CheckIcon className="h-5 w-5 text-white" />;
    } else if (step.status === "error") {
      return <AlertCircle className="h-5 w-5 text-white" />;
    } else if (step.status === "loading" && isLatest) {
      return <Loading />;
    } else {
      return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepIconBackground = () => {
    if (step.status === "success") {
      return "bg-green-500";
    } else if (step.status === "error") {
      return "bg-red-500";
    } else if (step.status === "loading" && isLatest) {
      return "bg-blue-500";
    } else {
      return "bg-gray-300";
    }
  };

  const getContentIcon = () => {
    const message = step.message.toLowerCase();
    if (message.includes("deploy")) {
      return <Rocket className="h-5 w-5 text-blue-500" />;
    } else if (message.includes("waiting") || message.includes("confirm")) {
      return <Clock className="h-5 w-5 text-orange-500" />;
    } else if (message.includes("database") || message.includes("saving")) {
      return <Database className="h-5 w-5 text-purple-500" />;
    } else if (message.includes("success")) {
      return <Trophy className="h-5 w-5 text-green-500" />;
    }
    return null;
  };

  return (
    <div
      className={`relative flex items-start space-x-4 p-4 rounded-lg border transition-all duration-500 ease-in-out ${
        step.status === "success"
          ? "bg-green-50 border-green-200"
          : step.status === "error"
          ? "bg-red-50 border-red-200"
          : step.status === "loading" && isLatest
          ? "bg-blue-50 border-blue-200 shadow-sm"
          : "bg-gray-50 border-gray-200"
      } ${isLatest ? "transform scale-105" : ""}`}
      style={{
        opacity: !isLatest && step.status !== "success" ? 0.6 : 1,
      }}
    >
      {/* Step number/status indicator */}
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${getStepIconBackground()}`}
      >
        {step.status === "loading" && isLatest ? (
          <div className="w-4 h-4">
            <Loading />
          </div>
        ) : (
          getStepIcon()
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          {getContentIcon()}
          <p
            className={`font-medium ${
              step.status === "success"
                ? "text-green-800"
                : step.status === "error"
                ? "text-red-800"
                : step.status === "loading" && isLatest
                ? "text-blue-800"
                : "text-gray-600"
            }`}
          >
            {step.message}
          </p>
        </div>

        {step.status === "error" && step.error && (
          <p className="text-red-600 text-sm mt-1 font-medium">{step.error}</p>
        )}

        {step.status === "success" && step.details && (
          <p className="text-green-600 text-sm mt-1">{step.details}</p>
        )}
      </div>

      {/* Loading animation for current step */}
      {step.status === "loading" && isLatest && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-30 rounded-lg animate-pulse" />
      )}
    </div>
  );
}

export default StatusDisplay;
