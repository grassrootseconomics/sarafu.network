import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface WarningProps {
  title?: string;
  message: string | React.ReactNode;
}
export const Warning = (props: WarningProps) => {
  return (
    <Alert variant="warning">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertTitle>{props.title ?? "Warning"}</AlertTitle>
      <AlertDescription>{props.message}</AlertDescription>
    </Alert>
  );
};
