import { AlertCircle, CheckIcon } from "lucide-react";
import React from "react";
import "tailwindcss/tailwind.css";
import { Loading } from "../loading";

interface ProgressStep {
  message: string;
  status: string;
  error?: string;
  address?: string;
}

const CreatePoolStats: React.FC<{ status: ProgressStep[] }> = ({ status }) => {
  return (
    <div className="p-6 ">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Please wait while we deploy your pool
      </h1>
      <div className="space-y-1">
        {status.length > 0 ? (
          status.map((step, index) => (
            <div
              key={index}
              className={`px-4 py-0 rounded-lg flex items-center space-x-4 transition-opacity duration-500 ease-in-out transform-gpu ${index != status.length - 1 ? "opacity-30" : ""} `}
              style={{ animation: "fadeIn 0.5s" }}
            >
              {step.status === "success" ||
                (index != status.length - 1 && (
                  <CheckIcon className="h-6 w-6 text-green-500" />
                ))}
              {step.status === "error" && (
                <AlertCircle className="h-6 w-6 text-red-500" />
              )}
              {step.status === "loading" && index == status.length - 1 && (
                <Loading />
              )}
              <div>
                <p className="font-medium">{step.message}</p>
                {step.status === "error" && (
                  <p className="text-red-500">{step.error}</p>
                )}
                {step.status === "success" && step.address && (
                  <p className="text-green-500">Address: {step.address}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
};

export default CreatePoolStats;
