"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { trpc } from "~/lib/trpc";
// Assume a charting library like Recharts or similar is available
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ReportsTabContentProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

// This interface is now defined by the tRPC query return type
// interface ReportStatsData {
//   tag: string;
//   count: number;
// }

// Placeholder data is no longer needed
// const placeholderData: ReportStatsData[] = [...];

export function ReportsTabContent({ dateRange }: ReportsTabContentProps) {
  // Implement tRPC query to fetch report statistics based on dateRange
  const { data, isLoading, error } = trpc.report.getStatsByTag.useQuery({
    from: dateRange.from,
    to: dateRange.to,
  });

  // Removed placeholder loading/error/data logic

  if (isLoading)
    return (
      <div className="col-span-12 text-center py-8">
        Loading report statistics...
      </div>
    );
  if (error) {
    // Log the error for debugging
    console.error("Error fetching report stats:", error);
    // Provide a user-friendly message, checking if it's a TRPCError
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return (
      <div className="col-span-12 text-center py-8 text-destructive">
        Error loading report statistics: {errorMessage}
      </div>
    );
  }
  // No need to check !data here if using optional chaining or default below
  if (data?.length === 0)
    return (
      <div className="col-span-12 text-center py-8 text-muted-foreground">
        No report data available for the selected period.
      </div>
    );

  return (
    <Card className="col-span-12">
      <CardHeader>
        <CardTitle>
          Reports by Tag ({dateRange.from.toLocaleDateString()} -{" "}
          {dateRange.to.toLocaleDateString()})
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {/* Placeholder for Chart */}
        <div className="h-[350px] w-full">
          {/* 
            Replace this div with an actual chart component.
            Example using Recharts (ensure it's installed and imported):
          */}
          {/*
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}> // Use fetched data here
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tag" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          */}
          <p className="text-center text-muted-foreground">
            Chart placeholder - Implement data fetching and visualization.
          </p>
          <ul className="mt-4 space-y-1 max-h-[280px] overflow-y-auto pr-4">
            {(data ?? []).map((item) => (
              <li
                key={item.tag}
                className="flex justify-between items-center p-2 hover:bg-muted/50 rounded"
              >
                <span className="font-medium text-sm">{item.tag}</span>
                <span className="text-sm font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
