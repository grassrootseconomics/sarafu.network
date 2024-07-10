import { cn } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
interface StatisticsCardProps {
  title: string;
  value: JSX.Element | string | number;
  delta: number | string;
  Icon: React.ElementType;
  className?:string;
  iconClassName?: string;
  contentClassName?: string;
  isIncrease: boolean;
}

const StatisticsCard = ({
  title,
  value,
  delta,
  Icon,
  className,
  iconClassName,
  contentClassName,

  isIncrease,
}: StatisticsCardProps) => {
  return (
    <Card className={cn("bg-secondary/80 text-secondary-foreground",className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("text-primary-foreground size-6", iconClassName)} />
      </CardHeader>
      <CardContent className={contentClassName}>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-primary-foreground/80">
          {delta && delta !== "0"
            ? `${isIncrease ? "+" : ""}
          ${delta}`
            : "-"}
        </p>
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;
