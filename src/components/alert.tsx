import {
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface AlertProps {
  title?: string;
  message: string | React.ReactNode;
}
export const WarningAlert = (props: AlertProps) => {
  return (
    <Alert variant="warning">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertTitle>{props.title ?? "Warning"}</AlertTitle>
      <AlertDescription>{props.message}</AlertDescription>
    </Alert>
  );
};
export const CollapsibleWarningAlert = (props: AlertProps) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="border-destructive/50 text-warning dark:border-destructive [&>svg]:text-warning">
          <ExclamationTriangleIcon className="h-4 w-4" />
          {props.title ?? "Warning"}
        </AccordionTrigger>
        <AccordionContent>{props.message}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export const InfoAlert = (props: AlertProps) => {
  return (
    <Alert variant="default">
      <InfoCircledIcon className="h-4 w-4" />
      <AlertTitle>{props.title ?? "Information"}</AlertTitle>
      <AlertDescription>{props.message}</AlertDescription>
    </Alert>
  );
};
