"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/lib/trpc";
import { stringToColour } from "~/utils/units";

interface ReportsTabContentProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function ReportsTabContent({ dateRange }: ReportsTabContentProps) {
  const { data, isLoading, error } = trpc.report.getStatsByTag.useQuery({
    from: dateRange.from,
    to: dateRange.to,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    console.error("Error fetching report stats:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return <ErrorState message={errorMessage} />;
  }

  if (data?.length === 0) {
    return <EmptyState />;
  }

  const chartData = (data ?? []).map((item) => ({
    tag: item.tag,
    count: item.count,
  }));

  return (
    <Card className="col-span-12 shadow-sm hover:shadow transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18"></path>
            <path d="M7 12v5"></path>
            <path d="M11 8v9"></path>
            <path d="M15 4v13"></path>
            <path d="M19 8v9"></path>
          </svg>
          Reports by Tag
        </CardTitle>
        <CardDescription>
          {dateRange.from.toLocaleDateString()} -{" "}
          {dateRange.to.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full mb-6 h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              defaultShowTooltip
            >
              <XAxis dataKey="tag" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Reports">
                {chartData.map((entry) => (
                  <Cell key={entry.tag} fill={stringToColour(entry.tag)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <h3 className="text-sm font-medium mb-2 text-muted-foreground">
          Tag Details
        </h3>
        <div className="w-full">
          <ul className="space-y-1.5 max-h-[500px] overflow-y-auto pr-4 rounded-md">
            {(data ?? []).map((item) => (
              <li key={item.tag}>
                <Link
                  href={`/reports?tags=${encodeURIComponent(item.tag)}`}
                  className="flex justify-between items-center p-2.5 hover:bg-muted rounded-md cursor-pointer transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  <span className="font-medium">{item.tag}</span>
                  <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {item.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <Card className="col-span-12">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-60 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[180px] w-full mb-6" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="col-span-12 border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          Error Loading Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-destructive">{message}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Please try again later or contact support if the issue persists.
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="col-span-12">
      <CardHeader>
        <CardTitle>Reports by Tag</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto text-muted-foreground mb-4"
        >
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
          <line x1="7" y1="2" x2="7" y2="22"></line>
          <line x1="17" y1="2" x2="17" y2="22"></line>
          <line x1="2" y1="12" x2="22" y2="12"></line>
        </svg>
        <p className="text-muted-foreground">
          No report data available for the selected period.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Try selecting a different date range.
        </p>
      </CardContent>
    </Card>
  );
}
