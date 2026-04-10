import { CircleCheck, Circle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";

type StatusType = "active" | "inactive" | "loading" | "error";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

/**
 * Consistent status badge component
 * Uses icons + text to ensure accessibility (not color-only)
 *
 * @example
 * <StatusBadge status="active" label="Active Balance" />
 */
export function StatusBadge({
  status,
  label,
  size = "md",
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const statusConfig = {
    active: {
      icon: CircleCheck,
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-700 dark:text-green-400",
      iconColor: "text-green-600 dark:text-green-500",
      defaultLabel: "Active",
    },
    inactive: {
      icon: Circle,
      bgColor: "bg-gray-100 dark:bg-gray-800",
      textColor: "text-gray-600 dark:text-gray-400",
      iconColor: "text-gray-500 dark:text-gray-500",
      defaultLabel: "Inactive",
    },
    loading: {
      icon: Loader2,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-700 dark:text-blue-400",
      iconColor: "text-blue-600 dark:text-blue-500",
      defaultLabel: "Loading",
      animated: true,
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-700 dark:text-red-400",
      iconColor: "text-red-600 dark:text-red-500",
      defaultLabel: "Error",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      badge: "px-2 py-0.5 text-xs",
      icon: "w-3 h-3",
      gap: "gap-1",
    },
    md: {
      badge: "px-2.5 py-1 text-sm",
      icon: "w-4 h-4",
      gap: "gap-1.5",
    },
    lg: {
      badge: "px-3 py-1.5 text-base",
      icon: "w-5 h-5",
      gap: "gap-2",
    },
  };

  const displayLabel = label || config.defaultLabel;

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        config.bgColor,
        config.textColor,
        sizeClasses[size].badge,
        sizeClasses[size].gap,
        className
      )}
      role="status"
      aria-label={`Status: ${displayLabel}`}
    >
      {showIcon && (
        <Icon
          className={cn(
            sizeClasses[size].icon,
            config.iconColor,
            status === "loading" && "animate-spin"
          )}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </span>
  );
}

/**
 * Simple status dot indicator
 * For use in compact layouts where full badge doesn't fit
 */
export function StatusDot({
  status,
  size = "md",
  label,
}: Pick<StatusBadgeProps, "status" | "size" | "label">) {
  const config = {
    active: "bg-green-500",
    inactive: "bg-gray-400",
    loading: "bg-blue-500 animate-pulse",
    error: "bg-red-500",
  };

  const sizeClass = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  return (
    <span
      className={cn(
        "inline-block rounded-full shrink-0",
        config[status],
        sizeClass[size]
      )}
      role="status"
      aria-label={label || `Status: ${status}`}
      title={label || `Status: ${status}`}
    />
  );
}
