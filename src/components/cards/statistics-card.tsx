import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface StatisticsCardProps {
  title: string;
  value: JSX.Element | string | number;
  delta: number | string;
  icon: JSX.Element;
  isIncrease: boolean;
}

const StatisticsCard = ({
  title,
  value,
  delta,
  icon,
  isIncrease,
}: StatisticsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
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
