"use client";

import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { type Address } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/lib/trpc";
import { stringToColour } from "~/utils/units/colour";

interface ReportsTabContentProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  vouchers: Address[];
}

export function ReportsByTagStats({
  dateRange,
  vouchers,
}: ReportsTabContentProps) {
  const { data, isLoading, error } = trpc.report.getStatsByTag.useQuery(
    {
      from: dateRange.from,
      to: dateRange.to,
      vouchers: vouchers,
    },
    {
      enabled: true,
      staleTime: 3_600_000, // 1 hour
    }
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    console.error("Error fetching report stats:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return <ErrorState message={errorMessage} />;
  }

  if (data?.stats?.length === 0) {
    return <EmptyState />;
  }

  const chartData = (data?.stats ?? []).map((item) => ({
    tag: item.tag,
    count: item.count,
    name: item.tag,
  }));

  const totalReports = data?.reportCount ?? 0;

  return (
    <div className="col-span-12">
      <div className="lg:h-[calc(100vh-20rem)] flex flex-col">
        <div className="flex flex-col lg:flex-row lg:gap-6 flex-1 min-h-0 pr-0">
          {/* Tag List - Left side on large screens */}
          <div className="lg:w-1/3 lg:order-1 order-2 flex flex-col">
            <Card className="flex-1 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col max-h-[400px] lg:max-h-none lg:h-full">
              <CardHeader className="pb-3 flex-shrink-0 hidden">
                <CardTitle className="text-lg hidden">Tag Details</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0 overflow-y-scroll">
                <ul className="space-y-2 h-full">
                  {(data?.stats ?? []).map((item) => (
                    <li key={item.tag}>
                      <Link
                        href={`/reports?tags=${encodeURIComponent(item.tag)}`}
                        className="flex justify-between items-center p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none border border-transparent hover:border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: stringToColour(item.tag),
                            }}
                          />
                          <span className="font-medium">{item.tag}</span>
                        </div>
                        <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                          {item.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Pie Chart - Right side on large screens */}
          <div className="lg:w-2/3 lg:order-2 order-1 mb-6 lg:mb-0 flex flex-col">
            <Card className="flex-1 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
              <CardContent className="flex-1 min-h-0 p-6 flex flex-col">
                <div className="flex-1 min-h-0 w-full">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    className={"min-h-[200px]"}
                  >
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        innerRadius="60%"
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {chartData.map((entry) => (
                          <Cell
                            key={entry.tag}
                            fill={stringToColour(entry.tag)}
                            stroke="white"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-3xl lg:text-4xl font-bold"
                      >
                        {totalReports}
                      </text>
                      <text
                        x="50%"
                        y="50%"
                        dy="1.5em"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-muted-foreground text-sm font-medium"
                      >
                        Total Reports
                      </text>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload?.[0]?.payload as {
                              tag: string;
                              count: number;
                            };
                            if (!data) return null;
                            const percentage = (
                              (data.count / totalReports) *
                              100
                            ).toFixed(1);
                            return (
                              <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor: stringToColour(data.tag),
                                    }}
                                  />
                                  <span className="font-semibold text-foreground">
                                    {data.tag}
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">
                                      Reports:
                                    </span>
                                    <span className="font-medium text-foreground">
                                      {data.count}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">
                                      Percentage:
                                    </span>
                                    <span className="font-medium text-foreground">
                                      {percentage}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                                    <div
                                      className="h-1.5 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${percentage}%`,
                                        backgroundColor: stringToColour(
                                          data.tag
                                        ),
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="col-span-12">
      <div className="lg:h-[calc(100vh-20rem)] flex flex-col">
        <div className="flex flex-col lg:flex-row lg:gap-6 flex-1 min-h-0">
          {/* Tag List Skeleton - Left side on large screens */}
          <div className="lg:w-1/3 lg:order-1 order-2 flex flex-col">
            <Card className="flex-1 shadow-sm flex flex-col max-h-[400px] lg:max-h-none">
              <CardHeader className="pb-3 flex-shrink-0">
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="flex-1 min-h-0 pt-0 overflow-hidden">
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pie Chart Skeleton - Right side on large screens */}
          <div className="lg:w-2/3 lg:order-2 order-1 mb-6 lg:mb-0 flex flex-col">
            <Card className="flex-1 shadow-sm flex flex-col">
              <CardContent className="flex-1 min-h-0 p-6 flex flex-col">
                <div className="flex-1 min-h-0 w-full">
                  <Skeleton className="h-full w-full rounded-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="col-span-12">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-destructive">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
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
        </h2>
      </div>

      <Card className="border-destructive/50 shadow-sm">
        <CardContent className="p-6">
          <p className="text-destructive mb-4">{message}</p>
          <p className="text-sm text-muted-foreground">
            Please try again later or contact support if the issue persists.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-12">
      <Card className="shadow-sm">
        <CardContent className="text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
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
          <p className="text-muted-foreground text-lg mb-2">
            No report data available for the selected period.
          </p>
          <p className="text-sm text-muted-foreground">
            Try selecting a different date range.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
