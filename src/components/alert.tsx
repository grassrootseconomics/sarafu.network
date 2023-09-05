import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
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

export const InfoAlert = (props: AlertProps) => {
  return (
    <Alert variant="default">
      <InfoCircledIcon className="h-4 w-4" />
      <AlertTitle>{props.title ?? "Information"}</AlertTitle>
      <AlertDescription>{props.message}</AlertDescription>
    </Alert>
  );
};
