import {
  CaretDownIcon,
  CaretUpIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { cva } from "class-variance-authority";
import { useState } from "react";
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

const collapsibleAlertVariants = cva("p-2", {
  variants: {
    variant: {
      info: "bg-blue-500/10 border-blue-500 [&>*:first-child]:text-blue-500",
      warning: "border-warning bg-warning/10 [&>*:first-child]:text-warning",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});
export const CollapsibleAlert = (props: AlertProps) => {
  const [open, setOpen] = useState(false);
  const Icon = AlertIcons[props.variant ?? "info"];

  return (
    <div
      className={cn(
        collapsibleAlertVariants({ variant: props.variant }),
        "rounded-md border"
      )}
    >
      <div
        className={"flex font-bold items-center gap-2  cursor-pointer"}
        onClick={() => setOpen((s) => !s)}
      >
        <Icon className="h-5 w-5" />
        {props.title}
        {open ? (
          <CaretUpIcon className="ml-auto h-7 w-7" />
        ) : (
          <CaretDownIcon className="ml-auto h-7 w-7" />
        )}
      </div>
      {open && <div className="">{props.message}</div>}
    </div>
  );
};
