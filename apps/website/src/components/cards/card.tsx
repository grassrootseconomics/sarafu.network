import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface CardProps {
  title: string;
  icon?: React.ReactElement;
  description?: string;
  children: React.ReactNode;
  className?: string;
}
export const BasicCard = (props: CardProps) => {
  return (
    <Card className={cn("overflow-hidden", props.className)}>
      <CardHeader className="bg-secondary/80 text-secondary-foreground py-3">
        <CardTitle className="flex items-center gap-4">
          {props.icon}
          {props.title}
        </CardTitle>
        {props.description && (
          <CardDescription>{props.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-4">{props.children}</CardContent>
    </Card>
  );
};
