import { CheckIcon, XIcon } from "lucide-react";
import React, { useCallback, useMemo, useReducer } from "react";
import { cn } from "~/lib/utils";
import { Icons } from "./icons";

type StatusProps = {
  status: "success" | "error" | "pending";
  title?: string;
  description?: string | React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "compact";
};

// Enhanced icon styling with better colors and sizing
const STATUS_ICONS = {
  success: (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
      <CheckIcon className="h-8 w-8 text-green-600" strokeWidth={2.5} />
    </div>
  ),
  error: (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 ring-8 ring-red-50">
      <XIcon className="h-8 w-8 text-red-600" strokeWidth={2.5} />
    </div>
  ),
  pending: (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 ring-8 ring-blue-50">
      <Icons.spinner className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  ),
} as const;

// Compact variant icons
const COMPACT_STATUS_ICONS = {
  success: (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
      <CheckIcon className="h-4 w-4 text-green-600" strokeWidth={2.5} />
    </div>
  ),
  error: (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
      <XIcon className="h-4 w-4 text-red-600" strokeWidth={2.5} />
    </div>
  ),
  pending: (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
      <Icons.spinner className="h-4 w-4 animate-spin text-blue-600" />
    </div>
  ),
} as const;

// Status colors for text and backgrounds
const STATUS_COLORS = {
  success: {
    title: "text-green-900",
    description: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  error: {
    title: "text-red-900",
    description: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  pending: {
    title: "text-blue-900",
    description: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
} as const;

export const Status: React.FC<StatusProps> = ({
  status,
  title,
  description,
  action,
  className,
  variant = "default",
}) => {
  const colors = STATUS_COLORS[status];
  const isCompact = variant === "compact";
  const icons = isCompact ? COMPACT_STATUS_ICONS : STATUS_ICONS;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border p-8 text-center transition-all duration-200",
        colors.bg,
        colors.border,
        isCompact && "p-4",
        className
      )}
    >
      <div className={cn("mb-4", isCompact && "mb-2")}>{icons[status]}</div>

      {title && (
        <h3
          className={cn(
            "text-lg font-semibold leading-tight",
            colors.title,
            isCompact && "text-base"
          )}
        >
          {title}
        </h3>
      )}

      {description && (
        <div
          className={cn(
            "mt-2 max-w-md text-sm leading-relaxed",
            colors.description,
            isCompact && "text-xs"
          )}
        >
          {description}
        </div>
      )}

      {action && (
        <div className={cn("mt-4", isCompact && "mt-3")}>{action}</div>
      )}
    </div>
  );
};

// Define state type
type StatusState = {
  status?: "success" | "error" | "pending";
  title?: string;
  description?: string | React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "compact";
};

// Define action types
type StatusAction =
  | {
      type: "UPDATE";
      payload: {
        status: "success" | "error" | "pending";
        title: string;
        description: string | React.ReactNode;
        action?: React.ReactNode;
        variant?: "default" | "compact";
      };
    }
  | { type: "RESET" };

// Reducer function
function statusReducer(state: StatusState, action: StatusAction): StatusState {
  switch (action.type) {
    case "UPDATE":
      return {
        status: action.payload.status,
        title: action.payload.title,
        description: action.payload.description,
        action: action.payload.action,
        variant: action.payload.variant,
      };
    case "RESET":
      return {
        status: undefined,
        title: undefined,
        description: undefined,
        action: undefined,
        variant: undefined,
      };
    default:
      return state;
  }
}

// Initial state
const initialState: StatusState = {
  status: undefined,
  title: undefined,
  description: undefined,
  action: undefined,
  variant: undefined,
};

export const useStatus = () => {
  const [state, dispatch] = useReducer(statusReducer, initialState);

  const update = useCallback(
    (
      status: "success" | "error" | "pending",
      title: string,
      description: string | React.ReactNode,
      action?: React.ReactNode,
      variant?: "default" | "compact"
    ) => {
      dispatch({
        type: "UPDATE",
        payload: { status, title, description, action, variant },
      });
    },
    []
  );

  const success = useCallback(
    (
      title: string,
      description: string | React.ReactNode,
      action?: React.ReactNode,
      variant?: "default" | "compact"
    ) => {
      update("success", title, description, action, variant);
    },
    [update]
  );

  const error = useCallback(
    (
      title: string,
      description: string | React.ReactNode,
      action?: React.ReactNode,
      variant?: "default" | "compact"
    ) => {
      update("error", title, description, action, variant);
    },
    [update]
  );

  const pending = useCallback(
    (
      title: string,
      description: string | React.ReactNode,
      action?: React.ReactNode,
      variant?: "default" | "compact"
    ) => {
      update("pending", title, description, action, variant);
    },
    [update]
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // Memoize the Status component to avoid recreation on every render
  const StatusComponent = useMemo(() => {
    return state.status ? (
      <Status
        status={state.status}
        title={state.title}
        description={state.description}
        action={state.action}
        variant={state.variant}
      />
    ) : null;
  }, [
    state.status,
    state.title,
    state.description,
    state.action,
    state.variant,
  ]);

  // Memoize the return object to avoid recreation
  return useMemo(
    () => ({
      Status: StatusComponent,
      update,
      success,
      error,
      pending,
      reset,
    }),
    [StatusComponent, update, success, error, pending, reset]
  );
};
