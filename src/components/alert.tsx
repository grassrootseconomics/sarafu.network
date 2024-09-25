"use client";
import {
  CaretDownIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { cva } from "class-variance-authority";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { AlertDescription, AlertTitle, Alert as ShadAlert } from "./ui/alert";

type AlertVariants = "warning" | "info";
interface AlertProps {
  variant: AlertVariants;
  title: string;
  message: string | React.ReactNode;
}

export const AlertIcons = {
  warning: ExclamationTriangleIcon,
  info: InfoCircledIcon,
} as const;
export const Alert = (props: AlertProps) => {
  const Icon = AlertIcons[props.variant ?? "info"];
  return (
    <ShadAlert variant="warning">
      <Icon className="h-4 w-4" />
      <AlertTitle>{props.title}</AlertTitle>
      <AlertDescription>{props.message}</AlertDescription>
    </ShadAlert>
  );
};

const collapsibleAlertVariants = cva("p-4", {
  variants: {
    variant: {
      info: "bg-blue-50 border-blue-200 text-blue-700 [&>*:first-child]:text-blue-500",
      warning:
        "bg-yellow-50 border-yellow-200 text-yellow-700 [&>*:first-child]:text-yellow-500",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});
export const CollapsibleAlert = (props: AlertProps) => {
  const [open, setOpen] = useState(false);
  const Icon = AlertIcons[props.variant ?? "info"];
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.maxHeight = open
        ? `${contentRef.current.scrollHeight}px`
        : "0";
    }
  }, [open]);

  return (
    <div
      className={cn(
        collapsibleAlertVariants({ variant: props.variant }),
        "rounded-lg border shadow-sm transition-all duration-200 hover:shadow-md"
      )}
    >
      <button
        className="flex w-full items-center justify-between gap-2 text-left font-semibold"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {props.title}
        </span>
        <span
          className={`transform transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <CaretDownIcon className="h-5 w-5" />
        </span>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: 0 }}
      >
        <div className="mt-2 text-sm">{props.message}</div>
      </div>
    </div>
  );
};
