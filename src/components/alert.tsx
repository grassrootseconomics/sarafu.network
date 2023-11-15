import {
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
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

const collapsibleAlertVariants = cva("", {
  variants: {
    variant: {
      info: "border-secondary text-secondary-foreground dark:border-secondary [&>svg]:text-secondary-foreground",
      warning:
        "border-destructive/50 text-warning dark:border-destructive [&>svg]:text-warning",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});
export const CollapsibleAlert = (props: AlertProps) => {
  const Icon = AlertIcons[props.variant ?? "info"];

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger
          className={cn(
            collapsibleAlertVariants({ variant: props.variant }),
            "text-secondary-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
          {props.title}
        </AccordionTrigger>
        <AccordionContent>{props.message}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
